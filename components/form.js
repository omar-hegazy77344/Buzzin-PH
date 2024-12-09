// app/components/ContactForm.js
'use client'; // This enables client-side features

import { useEffect, useRef } from 'react';
import SignaturePad from 'https://cdn.jsdelivr.net/npm/signature_pad@5.0.3/+esm';
import { jsPDF } from 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

export default function ContactForm() {
  const [year, setYear] = useState(new Date().getFullYear());
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const signatureInputRef = useRef(null);

  // Initialize SignaturePad and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const signaturePad = new SignaturePad(canvas);
    signaturePadRef.current = signaturePad;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      signaturePad.clear();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const handleClear = () => {
    signaturePadRef.current.clear();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!signaturePadRef.current.isEmpty()) {
      signatureInputRef.current.value = signaturePadRef.current.toDataURL();
      alert("Form submitted!");
    } else {
      alert("Please add a signature before submitting.");
    }
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    pdf.text(20, 20, "Lost And Found Report");
    pdf.text(20, 30, "Date Found: " + document.querySelector('input[name="Date"]').value);
    pdf.text(20, 40, "Time Found: " + document.querySelector('input[name="Time"]').value);
    pdf.text(20, 50, "Location: " + document.querySelector('input[name="location"]').value);
    pdf.text(20, 60, "Serial Number: " + document.querySelector('input[name="SerNum"]').value);
    pdf.text(20, 70, "Police Ref.: " + document.querySelector('input[name="ref"]').value);
    pdf.text(20, 80, "Found By: " + document.querySelector('input[name="Foundby"]').value);
    pdf.text(20, 90, "ID No.: " + document.querySelector('input[name="ID"]').value);
    pdf.text(20, 100, "Department: " + document.querySelector('input[name="Dept"]').value);
    pdf.text(20, 110, "Description: " + document.querySelector('textarea[name="description"]').value);

    if (!signaturePadRef.current.isEmpty()) {
      const imgData = signaturePadRef.current.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 20, 120, 180, 60);
    }

    pdf.save("LostAndFoundReport.pdf");
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form" id="contact-form">
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="Form Title" value="Lost Item Report" />

      <div className="input-wrap w-100">
        <input className="contact-input" name="location" type="text" required />
        <label>Location</label>
        <i className="icon fa-solid fa-location-dot"></i>
      </div>

      <div className="input-wrap">
        <input className="contact-input" name="SerNum" type="text" required />
        <label>Serial Number</label>
        <i className="icon fa-solid fa-hashtag"></i>
      </div>

      <div className="input-wrap">
        <input className="contact-input" name="ref" type="text" required />
        <label>Police Ref.</label>
        <i className="icon fa-solid fa-hashtag"></i>
      </div>

      <div className="input-wrap w-100">
        <input className="contact-input" name="Foundby" type="text" required />
        <label>Found By:</label>
        <i className="icon fa-solid fa-user"></i>
      </div>

      <div className="input-wrap">
        <input className="contact-input" name="ID" type="text" required />
        <label>ID No.</label>
        <i className="icon fa-solid fa-hashtag"></i>
      </div>

      <div className="input-wrap">
        <input className="contact-input" name="Dept" type="text" required />
        <label>Department</label>
        <i className="icon fa-solid fa-building"></i>
      </div>

      <div className="input-wrap textarea w-100">
        <textarea name="discription" className="contact-input" required></textarea>
        <label>Description</label>
        <i className="icon fa-solid fa-circle-info"></i>
      </div>

      <div className="input-wrap w-100">
        <label className="signature">Signature:</label>
        <canvas ref={canvasRef} style={{ border: '1px solid #000' }}></canvas>
        <input type="hidden" ref={signatureInputRef} name="signature-image" />
        <input type="button" onClick={handleClear} value="Clear" className="clear-btn" />
      </div>

      <div className="contact-buttons w-100">
        <input type="button" onClick={handleDownloadPDF} value="Download PDF" className="btn" />
        <input type="submit" value="Send Message" className="btn" />
      </div>
    </form>
  );
}
