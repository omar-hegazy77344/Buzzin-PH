"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './table.css';
import DescriptionIcon from '@mui/icons-material/Description';

const LostFoundTable = () => {
  const [items, setItems] = useState([]);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [overlayImageSrc, setOverlayImageSrc] = useState('');
  const router = useRouter();

  const fetchItems = async () => {
    try {
      const response = await fetch('../api/getLostItems');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageClick = (src) => {
    if (src) {
      setOverlayImageSrc(src);
      setIsOverlayVisible(true);
    }
  };

  const handleStatusClick = (id, Status) => {
    if (Status === 'lost') {
      router.push(`../return/${id}`); // Redirect to return page for lost items
    }
  };
  

  const closeOverlay = () => {
    setIsOverlayVisible(false);
  };

  const handledetailsClick = (id) => {
    router.push(`../items/${id}`); // Navigate to details page
  };
  return (
    <div className="datatable">
      <main className="table" id="customers_table">
        <section className="table__header">
          <h1>Lost & Found Items Table</h1>
        </section>
        <section className="table__body">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Ref</th>
                <th>Found By</th>
                <th>ID No.</th>
                <th>Signature</th>
                <th>Status</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={item.photoImage}
                      alt={item.ItemName}
                      style={{ cursor: 'pointer', borderRadius: '50%' }}
                      onClick={() => handleImageClick(item.photoImage)}
                    />
                    {item.ItemName}
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(item.createdAt).toLocaleTimeString()}</td>
                  <td>{item.ref}</td>
                  <td>{item.Foundby}</td>
                  <td>{item.ID}</td>
                  <td>
                    <img
                      src={item.signatureImage}
                      alt="Signature"
                      style={{ width: '50px', borderRadius: '5px', cursor: 'pointer' }}
                      onClick={() => handleImageClick(item.signatureImage)}
                    />
                  </td>
                  <td>
                    <p
                      className={`status ${item.Status === 'returned' ? 'returned' : 'lost'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleStatusClick(item._id, item.Status)}
                    >
                      {item.Status === 'returned' ? 'Returned' : 'Lost'}
                    </p>
                  </td>
                  <td>
                    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handledetailsClick(item._id)}>
                      <DescriptionIcon style={{ cursor: 'pointer', fontSize: '20px' }} />
                      <p>Show Details</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {overlayImageSrc && (
        <div
          className={`overlay ${isOverlayVisible ? 'visible' : ''}`}
          onClick={closeOverlay}
        >
          <img src={overlayImageSrc} alt="Enlarged" />
        </div>
      )}
    </div>
  );
};

export default LostFoundTable;
