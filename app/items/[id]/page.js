"use client";
import React, { useEffect, useState } from 'react';
import { use } from 'react';
import "./style.css";
import jsPDF from 'jspdf';

const ItemDetails = ({ params }) => {
  const { id } = use(params);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  const fetchItemDetails = async () => {
    try {
      const response = await fetch(`../../api/items/${id}`);
      if (!response.ok) throw new Error('Item not found');
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error('Error fetching item details:', error);
      setError('Failed to load item details');
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, []);

  const loadImage = (url) => new Promise((resolve, reject) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(`Failed to load image: ${url}`);
    img.src = url;
    setTimeout(() => reject(`Image load timeout: ${url}`), 5000);
  });

  const getImageFormat = (url) => {
    if (!url) return 'JPEG';
    const extension = url.split('.').pop().split('?')[0].toLowerCase();
    return extension === 'png' ? 'PNG' : 'JPEG';
  };

  const generatePDF = async () => {
    try {
      setPdfError(null);
      if (!item) throw new Error('No item data available');
      
      const doc = new jsPDF();
      const currentDate = new Date();
      const isLost = item.Status === "lost";
      const pictureWidth = 70;
      const pictureHeight = 50;

      const [
        logoImg,
        footerLogoImg,
        signatureImg,
        receiverSignatureImg,
        itemPhotoImg,
        receiverPhotoImg
      ] = await Promise.all([
        loadImage('/images/Logo-01.png'),
        loadImage('/images/static.png'),
        loadImage(item.signatureImage),
        loadImage(isLost ? null : item.Reciversignature),
        loadImage(isLost ? item.photoImage : item.Itemimg),
        loadImage(isLost ? null : item.ReciverImage)
      ]);

      // Header Section
      doc.setFontSize(18);
      doc.text("Lost And Found Report", 105, 20, { align: "center" });
      if (logoImg) doc.addImage(logoImg, getImageFormat(logoImg.src), 10, 10, 40, 20);
      
      doc.setFontSize(10);
      doc.text(currentDate.toLocaleString(), 200, 20, { align: "right" });
      doc.setLineWidth(0.5);
      doc.line(10, 30, 200, 30);

      // Dynamic Fields
      let fields = [];
      if (isLost) {
        fields = [
          ["Item Name:", item.ItemName],
          ["Date Lost:", new Date(item.Loston).toLocaleDateString()],
          ["Time Lost:", new Date(item.Loston).toLocaleTimeString()],
          ["Location:", item.location],
          ["Serial Number:", item.SerNum],
          ["Police Ref:", item.ref],
          ["Department:", item.Dept],
          ["Found By:", item.Foundby],
          ["Found By ID:", item.FoundbyID],
          ["Description:", item.description]
        ];
      } else {
        fields = [
          ["Item Name:", item.ItemName],
          ["Date Lost:", new Date(item.Loston).toLocaleDateString()],
          ["Time Lost:", new Date(item.Loston).toLocaleTimeString()],
          ["Location:", item.location],
          ["Serial Number:", item.SerNum],
          ["Reference:", item.ref],
          ["Department:", item.Dept],
          ["Found By:", item.Foundby],
          ["Found By ID:", item.FoundbyID],
          ["Description:", item.description],
          ["Receiver Name:", item.ReciverName],
          ["Receiver ID:", item.ReciverID],
          ["Contact Info:", item.ReciverContactInfo],
          ["Date Received:", new Date(item.createdAt).toLocaleDateString()],
          ["Time Received:", new Date(item.createdAt).toLocaleTimeString()]
        ];
      }

      let yOffset = 40;
      fields.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 20, yOffset);
        doc.setFont("helvetica", "normal");
        doc.text(value ? value.toString() : '', 60, yOffset);
        yOffset += 10;
      });

      // Image Handling
      if (!isLost) {
        if (receiverSignatureImg) {
          doc.text("Receiver's Signature:", 20, 220);
          doc.addImage(receiverSignatureImg, getImageFormat(receiverSignatureImg.src), 20, 225, pictureWidth, pictureHeight);
        }
        if (receiverPhotoImg) {
          doc.text("Receiver's Photo:", 100, 150);
          doc.addImage(receiverPhotoImg, getImageFormat(receiverPhotoImg.src), 100, 155, pictureWidth, pictureHeight);
        }
      }

      if (signatureImg) {
        doc.text("Founder's Signature:", 20, 220);
        doc.addImage(signatureImg, getImageFormat(signatureImg.src), 20, 225, pictureWidth, pictureHeight);
      }

      if (itemPhotoImg) {
        doc.text("Item Photo:", 100, 220);
        doc.addImage(itemPhotoImg, getImageFormat(itemPhotoImg.src), 100, 225, pictureWidth, pictureHeight);
      }

      // Footer
      doc.setLineWidth(0.5);
      doc.line(10, 280, 200, 280);
      doc.setFontSize(8);
      doc.text("© 2024 Buzzin. Powered by Buzzin", 20, 290);
      if (footerLogoImg) doc.addImage(footerLogoImg, getImageFormat(footerLogoImg.src), 180, 282, 10, 10);

      const itemId = item._id || item.id || 'unknown-id';
      doc.save(`${item.Status}_report_${itemId}.pdf`);

    } catch (error) {
      console.error('PDF generation failed:', error);
      setPdfError('Failed to generate PDF. Please ensure all images are valid.');
    }
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!item) return <div className="loading-message">Loading...</div>;

  return (
    <div className="item-details">
      {pdfError && <div className="pdf-error">{pdfError}</div>}
      
      <div className="header-section">
        <h1>Item Details</h1>
        <div className="header-controls">
          <p className={`status-label ${item.Status}`}>{item.Status.toUpperCase()}</p>
          <button 
            onClick={generatePDF} 
            className="btn"
            disabled={!item}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="item-info">
        <h3><strong>Item Name:</strong> {item.ItemName}</h3>

        {item.Status === "returned" && (
          <div className="image-section">
            <h3>Item Image</h3>
            <img src={item.Itemimg} alt="Item" className="itemimage-preview" />
          </div>
        )}

        {item.Status === "lost" ? (
          <>
            <p><strong>Date Lost:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
            <p><strong>Time Lost:</strong> {new Date(item.createdAt).toLocaleTimeString()}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Serial Number:</strong> {item.SerNum}</p>
            <p><strong>Reference:</strong> {item.ref}</p>
            <p><strong>Found By:</strong> {item.Foundby}</p>
            <p><strong>Department:</strong> {item.Dept}</p>
            <p><strong>ID:</strong> {item.ID}</p>
          </>
        ) : item.Status === "returned" ? (
          <>
            <p><strong>Date Lost:</strong> {new Date(item.Loston).toLocaleDateString()}</p>
            <p><strong>Time Lost:</strong> {new Date(item.Loston).toLocaleTimeString()}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Serial Number:</strong> {item.SerNum}</p>
            <p><strong>Reference:</strong> {item.ref}</p>
            <p><strong>Found By:</strong> {item.Foundby}</p>
            <p><strong>Found By ID:</strong> {item.FoundbyID}</p>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Receiver Name:</strong> {item.ReciverName}</p>
            <p><strong>Receiver ID:</strong> {item.ReciverID}</p>
            <p><strong>Receiver Contact Info:</strong> {item.ReciverContactInfo}</p>
            <p><strong>Date Received:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
            <p><strong>Time Received:</strong> {new Date(item.createdAt).toLocaleTimeString()}</p>
          </>
        ) : (
          <p><strong>Status:</strong> Unknown</p>
        )}
      </div>

      <div className="details-section">
        <div className="photo-section">
          <h3>Photo</h3>
          <img
            src={item.Status === "lost" ? item.photoImage : item.ReciverImage}
            alt="Item"
            className="image-preview"
          />
        </div>
        <div className="signature-section">
          <h3>Signature</h3>
          <img
            src={item.Status === "lost" ? item.signatureImage : item.Reciversignature}
            alt="Signature"
            className="image-preview"
          />
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
