"use client";
import React, { useEffect, useState } from 'react';
import { use } from 'react';
import "./style.css";

const ItemDetails = ({ params }) => {
  const { id } = use(params); // Unwrap params to access id
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

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

  if (error) return <div className="error-message">{error}</div>;
  if (!item) return <div className="loading-message">Loading...</div>;

  return (
    <div className="item-details">
      <div className="header-section">
        <h1>Item Details</h1>
        <p className={`status-label ${item.Status}`}>{item.Status.toUpperCase()}</p>
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
