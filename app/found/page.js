"use client"
import React, { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faLocationDot, faUser, faBuilding, faCircleInfo, faFileSignature, faFont, faIdCard, faPhone, faIdBadge  } from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const LostAndFoundReport = () => {

    const inputRefs = useRef([]);
    const canvasRef = useRef(null);
    const signatureInputRef = useRef(null);
    const signaturePadRef = useRef(null);

    const videoRef = useRef(null);
    const photoCanvasRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [cameraFacingMode, setCameraFacingMode] = useState("environment");

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
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePadRef.current.clear();
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();

      return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

 // Camera Setup
  const openCamera = async () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: cameraFacingMode }
    });
    videoRef.current.srcObject = stream;
    setIsCameraOpen(true);
  }
};

  const capturePhoto = () => {
  const video = videoRef.current;
  const canvas = photoCanvasRef.current;
  const context = canvas.getContext("2d");

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  setPhoto(canvas.toDataURL("image/png"));

  // Stop camera stream
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
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
    ItemName: inputRefs.current[0]?.value || '',
    RecivedBy: inputRefs.current[1]?.value || '',
    ID: inputRefs.current[2]?.value || '',
    ContactInfo: inputRefs.current[3]?.value || '',
    Foundby: inputRefs.current[4]?.value || '',
    ref: inputRefs.current[5]?.value || '',
    BadgeNum: inputRefs.current[6]?.value || '',
    description: inputRefs.current[7]?.value || '',
    status: inputRefs.current[8]?.value || '',
    signatureImage: signaturePadRef.current.isEmpty() ? "" : signaturePadRef.current.toDataURL(),
    photoImage: photo || ""
  };

  // Check Photo availability
  if (!formData.photoImage) {
    alert("Please add a Photo before submitting.");
    return;
  }

  // Check Signature availability
  if (!formData.signatureImage) {
    alert("Please add a signature before submitting.");
    return;
  }

  // Send form data to your API route
  try {
    const response = await fetch('/api/lost-and-found', { // Adjust the API route to match your setup
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('MangoDB Form submitted successfully!');

      // Clear each input field
      inputRefs.current.forEach((input) => (input ? (input.value = "") : null));
      signaturePadRef.current.clear();
      setPhoto(null);
    } else {
      const errorResponse = await response.json(); // Get the error message from the response
      alert(`Error: ${errorResponse.message || 'There was an error submitting the form. Please try again.'}`);
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
    const logoUrl = '/images/Logo-01.png'; // Add your logo image path here
    const footerLogoUrl = '/images/static.png'; // Add your footer logo image path here

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

    // Form fields in rows
    const labels = [
      "Item Name", "Recived By:", "ID Number:", "Contact Info:", "Found By:", "Item Ref", "Badge No:", "Description:"
    ];
    labels.forEach((label, index) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, 40 + index * 10);
      doc.setFont("helvetica", "normal");
      doc.text(inputRefs.current[index]?.value || '', 60, 40 + index * 10);
    });

    // Signature
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureImg = signaturePadRef.current.toDataURL("image/png");
      const signature = await html2canvas(canvasRef.current);
      doc.addImage(signatureImg, "PNG", 20, 120, 70, 50);
    }

    // Photo
    if (photo) {
      doc.addImage(photo, 'PNG', 20, 200, 70, 50);
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

    doc.save("LostAndFoundReport.pdf");
  };

  return (
    <div className="contact">
      <div className="wrapper">
        <h2>Lost And Found Report</h2>
        <form onSubmit={handleSubmit} id="contact-form" className="contact-form">

          <input type="hidden" name="status" value="returned"  ref={(el) => (inputRefs.current[8] = el)}/>

          {/* Item Name */}
          <div className="input-wrap w-100">
            <input className="contact-input" name="Item Name" type="text" ref={(el) => (inputRefs.current[0] = el)} required />
            <label>Item Name</label>
            <FontAwesomeIcon icon={faFont} className="icon" />
          </div>

          {/* Recived By */}
          <div className="input-wrap w-100">
            <input className="contact-input" name="Recived By" type="text" ref={(el) => (inputRefs.current[1] = el)} required />
            <label>Recived by:</label>
            <FontAwesomeIcon icon={faUser} className="icon" />
          </div>

          {/* <!-- ID Number --> */}
          <div className="input-wrap">
            <input className="contact-input" autoComplete="off" name="ID" type="text" required ref={(el) => (inputRefs.current[2] = el)} />
            <label>ID No.</label>
            <FontAwesomeIcon icon={faIdCard} className="icon" />
          </div>

          {/* Contact Info */}
          <div className="input-wrap">
            <input className="contact-input" autoComplete="off" name="Contact Info" type="tel" required ref={(el) => (inputRefs.current[3] = el)} />
            <label htmlFor="phone">Contact Info.</label>
            <FontAwesomeIcon icon={faPhone} className="icon" />
          </div>

          {/* <!-- Found By --> */}
          <div className="input-wrap w-100">
            <input className="contact-input" autoComplete="off" name="Foundby" type="text" ref={(el) => (inputRefs.current[4] = el)} required />
            <label>Found By:</label>
            <FontAwesomeIcon icon={faUser} className="icon" />
          </div>

          {/* Item Ref Number */}
          <div className="input-wrap">
            <input className="contact-input" name="Item Ref Numb" type="text" ref={(el) => (inputRefs.current[5] = el)} required />
            <label>Item Ref Number</label>
            <FontAwesomeIcon icon={faHashtag} className="icon" />
          </div>

          {/* <!-- Badge Number --> */}
          <div className="input-wrap">
            <input className="contact-input" autoComplete="off" name="ID" type="text" required ref={(el) => (inputRefs.current[6] = el)} />
            <label>Badge No.</label>
            <FontAwesomeIcon icon={faIdBadge} className="icon" />
          </div>
        
          {/*<!-- Description -->*/}
          <div className="input-wrap textarea w-100">
            <textarea name="discription" autoComplete="off" className="contact-input" ref={(el) => (inputRefs.current[7] = el)} required></textarea>
            <label>Description</label>
            <FontAwesomeIcon icon={faCircleInfo} className="icon" />
          </div>

          {/* Signature Canvas */}
          <div className="input-wrap w-100">
            <label className="signature">Signature:</label>
            <canvas ref={canvasRef} className="contact-input" style={{ border: "1px solid #000" }}></canvas>
            <FontAwesomeIcon icon={faFileSignature} className="icon sign" />
            <input type="hidden" ref={signatureInputRef} name="signatureImage" />
            <button type="button" onClick={() => signaturePadRef.current.clear()} className="clear-btn">Clear</button>
          </div>

          {/* Camera & Photo Capture */}
          <div className="input-wrap">
          {photo ? (
            <div>
              <img src={photo} alt="Captured" style={{ width: '100%', height: '150px' }} />
              <button type="button" onClick={retakePhoto} className="btn">Retake Photo</button>
            </div>
          ) : (
            <div>
              <video ref={videoRef} autoPlay playsInline style={{ display: isCameraOpen ? 'block' : 'none', width: '100%' }} />
              <button type="button" onClick={isCameraOpen ? capturePhoto : openCamera} className="btn"
              
              >
                {isCameraOpen ? "Take Photo" : "Open Camera"}
              </button>
            </div>
          )}
            <canvas ref={photoCanvasRef} style={{ display: 'none' }} width={300} height={150}></canvas>
          </div>

          {/* Clear Form Button */}
          <button className="clear-btn"  
          type="button" onClick={clearForm}>
            Clear Form
          </button> 

          {/* Buttons */}
          <div className="contact-buttons w-100">
            <button className="btn" type="submit">Submit</button>
            <button className="btn" type="button" onClick={downloadPDF}>Download PDF</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostAndFoundReport;
