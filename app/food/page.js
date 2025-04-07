"use client"
import React, { use, useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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


const FoodReport = ({ params }) => {

  const inputRefs = useRef([]);
  const signaturePadRef = useRef(null);
  const canvasRef = useRef(null);
  const signatureInputRef = useRef(null);

  const videoRef = useRef(null);
  const photoCanvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");

  useEffect(() => {
    if (isCameraOpen) {
      openCamera();
    }
  }, [cameraFacingMode]);

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
      alert("Unable to access the camera. Please ensure camera permissions are enabled.");
    }
  };

  const switchCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }

    // Update camera mode (State change happens asynchronously)
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

  //Submitting the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      Name: inputRefs.current[0]?.value || '',
      ID: inputRefs.current[1]?.value || '',
      ContactInfo: inputRefs.current[2]?.value || '',
      signatureImage: signaturePadRef.current.isEmpty() ? "" : signaturePadRef.current.toDataURL(),
      photoImage: photo || " ",
      Status: "Food",
    };

    // if (!formData.photoImage) {
    //   alert("Please add a Photo before submitting.");
    //   return;
    // }

    if (!formData.signatureImage) {
      alert("Please add a signature before submitting.");
      return;
    }

    try {
      const response = await fetch('./api/food', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Form submitted successfully!');
        inputRefs.current.forEach((input) => (input ? (input.value = "") : null));
        signaturePadRef.current.clear();
        setPhoto(null);
      } else {
        alert('There was an error submitting the form. Please try again.');
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
    const logoUrl = '../public/images/Logo-01.png'; // Add your logo image path here
    const footerLogoUrl = '../public/images/static.png'; // Add your footer logo image path here

    // Title
    doc.setFontSize(18);
    doc.text("Lost And Found Report", 105, 20, null, null, "center");

    // Logo
    if (logoUrl) {
      const img = new Image();
      img.src = logoUrl;
      doc.addImage(img, 'PNG', 10, 10, 40, 20);
    }

    // Date and Header
    doc.setFontSize(10);
    doc.text(currentDate.toLocaleString(), 200, 20, null, null, "right");
    doc.setLineWidth(0.5);
    doc.line(10, 30, 200, 30);

    // Fields and Data
    const fields = [
      { label: "Item Name:", value: inputRefs.current[7]?.value || '' },
      { label: "Location:", value: inputRefs.current[0]?.value || '' },
      { label: "Serial Number:", value: inputRefs.current[1]?.value || '' },
      { label: "Police Ref:", value: inputRefs.current[2]?.value || '' },
      { label: "Found By:", value: inputRefs.current[3]?.value || '' },
      { label: "ID No:", value: inputRefs.current[4]?.value || '' },
      { label: "Department:", value: inputRefs.current[5]?.value || '' },
      { label: "Description:", value: inputRefs.current[6]?.value || '' },
    ];

    let yPosition = 40;
    fields.forEach((field) => {
      doc.setFont("helvetica", "bold");
      doc.text(field.label, 20, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(field.value, 60, yPosition);
      yPosition += 10; // Increment Y position for next field
    });

    // Signature
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureImg = signaturePadRef.current.toDataURL("image/png");
      doc.setFont("helvetica", "bold");
      doc.text("Signature:", 20, yPosition);
      doc.addImage(signatureImg, "PNG", 60, yPosition - 5, 70, 30);
      yPosition += 40; // Increment Y position for photo
    }

    // Photo
    if (photo) {
      doc.setFont("helvetica", "bold");
      doc.text("Photo:", 20, yPosition);
      doc.addImage(photo, 'PNG', 60, yPosition - 5, 70, 50);
      yPosition += 60; // Increment Y position for next section
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
        <h2>Food Delivery Disclaimer Form</h2>
        <div className="input-wrap w-100 not-empty focus" >
          <p className="info-box">
            I, the udersigned, acknowledge that I have requested food delivery to Park Hyatt and I fully agree that the hotel is not liable for any consequences that may result due to the consumption of the food I ordered.
          </p>
          <label className="infolable">Disclaimer </label>
          <InfoIcon className="infoicon" />
        </div>
        <form onSubmit={handleSubmit} id="contact-form" className="contact-form">
          <input type="hidden" name="status" value="returned" ref={(el) => (inputRefs.current[3] = el)} />

          {/* Reciver Name */}
          <div className="input-wrap w-100 ">
            <input className="contact-input" name="Reciver Name" type="text" ref={(el) => (inputRefs.current[0] = el)} required />
            <label>Receiver  Name</label>
            <PersonIcon className="icon" />
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
            <DrawIcon className="icon sign" />
            <input type="hidden" ref={signatureInputRef} name="signatureImage" />
            <button type="button" onClick={() => signaturePadRef.current.clear()} className="clear-btn">Clear</button>
          </div>

          {/* Camera & Photo Capture */}
          <div className="input-wrap">
            {photo ? (
              <div>
                <img src={photo} alt="Captured" style={{ width: '100%' }} />
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

export default FoodReport;
