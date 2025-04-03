"use client"
import React, { use, useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "./style.css";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DrawIcon from '@mui/icons-material/Draw';
import InfoIcon from '@mui/icons-material/Info';
import BadgeIcon from '@mui/icons-material/Badge';
import NumbersIcon from '@mui/icons-material/Numbers';
import PersonIcon from '@mui/icons-material/Person';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { Cameraswitch, PhotoCamera } from '@mui/icons-material';
import withAuth from '@/lib/withAuth';

const ReturnReport = ({ params }) => {

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

  /* ------------------------ */

    const inputRefs = useRef([]);
    const canvasRef = useRef(null);
    const signatureInputRef = useRef(null);
    const signaturePadRef = useRef(null);

    const videoRef = useRef(null);
    const photoCanvasRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [cameraFacingMode, setCameraFacingMode] = useState("environment");
useEffect(() => {
  if (isCameraOpen) {
    openCamera(); // This will now use the updated cameraFacingMode
  }
}, [cameraFacingMode]); // Runs every time cameraFacingMode changes

    // code for the bluring of Foucus and Unfocus feilds
    useEffect(() => {
      const inputs = inputRefs.current;
  
      const handleFocus = (event) => {
        const parent = event.target.parentNode;
        parent.classList.add("focus");
        parent.classList.add("not-empty");
      };
  
      const handleBlur = (event) => {
        const parent = event.target.parentNode;
        if (event.target.value === "") {
          parent.classList.remove("not-empty");
        }
        parent.classList.remove("focus");
      };
  
      // Add event listeners
      inputs.forEach((input) => {
        input.addEventListener("focus", handleFocus);
        input.addEventListener("blur", handleBlur);
      });
    
      // Cleanup: remove event listeners
      return () => {
        inputs.forEach((input) => {
          if (input && (input.tagName === "INPUT" || input.tagName === "TEXTAREA")) {
            input.addEventListener("focus", handleFocus);
            input.addEventListener("blur", handleBlur);
          }
        });
    };
    
    }, []);

    // Initialize SignaturePad and handle canvas resizing
    useEffect(() => {
      const canvas = canvasRef.current;
      signaturePadRef.current = new SignaturePad(canvas);

     const resizeCanvas = () => {
  const canvas = canvasRef.current;
  const signaturePad = signaturePadRef.current;

  if (!canvas || !signaturePad) return;

  // Save the current signature as an image
  const signatureData = signaturePad.isEmpty() ? null : signaturePad.toDataURL();

  // Resize the canvas
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);

  // Restore the saved signature
  if (signatureData) {
    signaturePad.fromDataURL(signatureData);
  }
};


      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();

      return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

 // Camera Setup
const openCamera = async () => {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode },
      });
      videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
    }
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
};

const switchCamera = () => {
  if (videoRef.current && videoRef.current.srcObject) {
    const tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  }

  // Update camera mode and wait for state change
  setCameraFacingMode((prevMode) => (prevMode === "environment" ? "user" : "environment"));
};

const capturePhoto = () => {
  const video = videoRef.current;
  const canvas = photoCanvasRef.current;
  const context = canvas.getContext("2d");

  // Set canvas dimensions to match video dimensions
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  // Draw video frame onto canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Save the photo as a Base64 image
  setPhoto(canvas.toDataURL("image/png"));

  // Stop camera stream
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  setIsCameraOpen(false);
};

const retakePhoto = () => {
  setPhoto(null);
  openCamera();
};

// Submitting the form
const handleSubmit = async (e) => {
  e.preventDefault();

  // Collect form data from refs
  const formData = {
    ItemName: item.ItemName,
    location: item.location,
    SerNum: item.SerNum,
    ref: item.ref,
    Foundby: item.Foundby,
    FoundbyID: item.ID,
    description: item.description,
    Foundersignature: item.signatureImage,
    Itemimg: item.photoImage,
    Status: inputRefs.current[3]?.value || '',
    Loston:item.createdAt,
    ReciverName: inputRefs.current[0]?.value || '',
    ReciverID: inputRefs.current[1]?.value || '',
    ReciverContactInfo: inputRefs.current[2]?.value || '',
    Reciversignature: signaturePadRef.current.isEmpty() ? "" : signaturePadRef.current.toDataURL(),
    ReciverImage: photo || "",
  };

  // Check Photo availability
  if (!formData.ReciverImage) {
    alert("Please add a Photo before submitting.");
    return;
  }

  // Check Signature availability
  if (!formData.Reciversignature) {
    alert("Please add a signature before submitting.");
    return;
  }

  try {
    // Add the item to the "returned" database
    const returnResponse = await fetch('../../api/return', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!returnResponse.ok) {
      const errorResponse = await returnResponse.json();
      alert(`Error: ${errorResponse.message || 'There was an error submitting the form. Please try again.'}`);
      return;
    }

    // Remove the item from the "lost" database
    const deleteResponse = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    });

    if (deleteResponse.ok) {
      alert('Item successfully moved to the returned database and removed from the lost database.');

      // Clear each input field
      inputRefs.current.forEach((input) => (input ? (input.value = "") : null));
      signaturePadRef.current.clear();
      setPhoto(null);
    } else {
      const errorResponse = await deleteResponse.json();
      alert(`Error: ${errorResponse.message || 'Failed to remove item from the lost database.'}`);
    }
  } catch (error) {
    alert('An error occurred. Please try again.');
  }
};

// clearForm function
const clearForm = () => {
  // Clear input fields
  inputRefs.current.forEach((input) => {
    if (input) {
      input.value = ""; // Reset the value of each input
    }
  });

  // Clear the signature pad
  signaturePadRef.current.clear();

  // Clear the photo
  setPhoto(null);

  // Optional: close the camera if it was open (can be modified based on desired behavior)
  setIsCameraOpen(false);
};

// Download PDF
const downloadPDF = async () => {
  const doc = new jsPDF();
  const currentDate = new Date();
  const logoUrl = '../../../public/images/Logo-01.png'; // Add your logo image path here
  const footerLogoUrl = '../../../public/images/static.png'; // Add your footer logo image path here

  // Add title and logos
  doc.setFontSize(18);
  doc.text("Lost And Found Report", 105, 20, null, null, "center");
  if (logoUrl) {
    const img = new Image();
    img.src = logoUrl;
    doc.addImage(img, 'PNG', 10, 10, 40, 20);
  }
  doc.setFontSize(10);
  doc.text(currentDate.toLocaleString(), 200, 20, null, null, "right");
  doc.setLineWidth(0.5);
  doc.line(10, 30, 200, 30);

  // Form fields and labels
  const formData = {
    "Item Name": item?.ItemName || '',
    "Reference": item?.ref || '',
    "Location": item?.location || '',
    "Found By": item?.Foundby || '',
    "Founder ID": item?.ID || '',
    "Description": item?.description || '',
    "Reciver Name": inputRefs.current[0]?.value || '',
    "Reciver ID": inputRefs.current[1]?.value || '',
    "Reciver Contact Info": inputRefs.current[2]?.value || '',
    "Status": inputRefs.current[3]?.value || 'Returned',
    "Lost On": item?.createdAt ? new Date(item.createdAt).toLocaleString() : '',
  };

  let yOffset = 40; // Starting y position
  Object.entries(formData).forEach(([key, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(key + ":", 20, yOffset);
    doc.setFont("helvetica", "normal");
    doc.text(value, 60, yOffset);
    yOffset += 10; // Increment y position for next field
  });

  // Place pictures in a "window" layout
  const pictureWidth = 70;
  const pictureHeight = 50;

  // Receiver's Signature (Top-Left)
  if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
    const signatureImg = signaturePadRef.current.toDataURL("image/png");
    doc.text("Receiver's Signature:", 20, 150);
    doc.addImage(signatureImg, "PNG", 20, 155, pictureWidth, pictureHeight); // Top-Left corner
  }

  // Receiver's Photo (Top-Right)
  if (photo) {
    doc.text("Receiver's Photo:", 100, 150);
    doc.addImage(photo, "PNG", 100, 155, pictureWidth, pictureHeight); // Top-Right corner
  }

  // Founder's Signature (Bottom-Left)
  if (item?.signatureImage) {
    doc.text("Founder's Signature:", 20, 220);
    doc.addImage(item.signatureImage, "PNG", 20, 225, pictureWidth, pictureHeight); // Bottom-Left corner
  }

  // Item Photo (Bottom-Right)
  if (item?.photoImage) {
    doc.text("Item Photo:", 100, 220);
    doc.addImage(item.photoImage, "PNG", 100, 225, pictureWidth, pictureHeight); // Bottom-Right corner
  }

  // Footer
  doc.setLineWidth(0.5);
  doc.line(10, 280, 200, 280);
  doc.setFontSize(8);
  doc.text("© 2024 Buzzin. Powered by Buzzin", 20, 290);
  if (footerLogoUrl) {
    const footerImg = new Image();
    footerImg.src = footerLogoUrl;
    doc.addImage(footerImg, 'PNG', 180, 282, 10, 10);
  }

  doc.save("ReturnReport.pdf");
};


  return (
    <div className="contact">
      <div className="wrapper">
        <h2>Return Item Report</h2>
        <form onSubmit={handleSubmit} id="contact-form" className="contact-form">

        {item ? (
  <>
    {/* Read-only fields */}
    <div className="input-wrap not-empty w-100">
      <input className="contact-input" type="text" value={item.ItemName || ''} readOnly />
      <label>Item Name</label>
      <TextFieldsIcon  className="icon" />
    </div>
    <div className="input-wrap not-empty">
      <input className="contact-input" type="text" value={item.ref || ''} readOnly />
      <label>Reference</label>
      <NumbersIcon  className="icon" />
    </div>
    <div className="input-wrap not-empty">
      <input className="contact-input" type="text" value={item.location || ''} readOnly />
      <label>Location</label>
      <LocationOnIcon className="icon" />
    </div>
    <div className="input-wrap not-empty">
      <input className="contact-input" type="text" value={item.Foundby || ''} readOnly />
      <label>Found By</label>
      <PersonIcon  className="icon" />
    </div>
    <div className="input-wrap not-empty">
      <input className="contact-input" type="text" value={item.ID || ''} readOnly />
      <label>Founder ID</label>
      <BadgeIcon className="icon" />
    </div>
    <div className="input-wrap w-100 not-empty">
      <input className="contact-input" type="text" value={item.description || ''} readOnly />
      <label>Description</label>
      <InfoIcon className='icon'/>
    </div>

    <div className="input-wrap">
      <p>Founder Signature</p>
      <img src={item.signatureImage} alt="Signature" className="signature-image" />
    </div>
    
    <div className="input-wrap">
      <p>Item Photo</p>
      <img src={item.photoImage} alt="Item" className="photo-image" />
    </div>
    {/* Read-only fields */}
  </>
) : (
  <div className="loading-message">Loading...</div>
)}

          <input type="hidden" name="status" value="returned"  ref={(el) => (inputRefs.current[3] = el)}/>

          {/* Reciver Name */}
          <div className="input-wrap w-100">
            <input className="contact-input" name="Reciver Name" type="text" ref={(el) => (inputRefs.current[0] = el)} required />
            <label>Receiver  Name</label>
            <PersonIcon  className="icon" />
          </div>

          {/* Reciver ID */}
          <div className="input-wrap">
            <input className="contact-input" name="Reciver ID" type="text" ref={(el) => (inputRefs.current[1] = el)} required />
            <label>Receiver  ID:</label>
            <BadgeIcon className="icon" />
          </div>

          {/* Reciver Contact Info */}
          <div className="input-wrap">
            <input className="contact-input" autoComplete="off" name="Reciver Contact Info" type="tel" required ref={(el) => (inputRefs.current[2] = el)} />
            <label htmlFor="phone"> Contact Info.</label>
            <LocalPhoneIcon className="icon" />
          </div>

          {/* Signature Canvas */}
          <div className="input-wrap w-100">
            <label className="signature">Signature:</label>
            <canvas ref={canvasRef} className="contact-input" style={{ border: "1px solid #000" }}></canvas>
            <DrawIcon className="icon sign"/>
            <input type="hidden" ref={signatureInputRef} name="signatureImage" />
            <button type="button" onClick={() => signaturePadRef.current.clear()} className="clear-btn">Clear</button>
          </div>

          {/* Camera & Photo Capture */}
          <div className="input-wrap">
         
            {photo ? (
              <div>
                <img src={photo} alt="Captured" style={{ width: '100%'}} />
                <button type="button" onClick={retakePhoto} className="btn">Retake Photo</button>
              </div>
            ) : (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    display: isCameraOpen ? 'block' : 'none',
                    width: '100%',
                  }}
                />
                <div>
                  <button
                    type="button"
                    onClick={isCameraOpen ? capturePhoto : openCamera}
                    className="ibtn"
                    style={{ marginTop: "10px" }}
                  >
                    <PhotoCamera />
                    {isCameraOpen ? "Take Photo" : "Open Camera"}
                  </button>
                  {isCameraOpen && (
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="clear-btn switch-camera-btn"
                      style={{ marginTop: "10px" }}
                    >
                      <Cameraswitch />
                      Switch Camera
                      
                    </button>
                  )}
                  
                </div>
              </div>
            )}
            <canvas
              ref={photoCanvasRef}
              style={{ display: 'none' }}
              width={300}
              height={150}
            ></canvas>
          
          </div>

          {/* Clear Form Button */}
          <button className="clear-btn"  
          type="button" >
            
          </button> 

          {/* Buttons */}
          <div className="contact-buttons w-100">
            <button className="ibtn" type="submit">
            <div>
            Submit
            </div>
            <SendIcon className="icon" />
            </button>
           <button className="btn"  
          type="button" onClick={clearForm}>
            Clear Form
          </button> 
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAuth(ReturnReport);
