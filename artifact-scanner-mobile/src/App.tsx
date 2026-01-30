import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Firebase Imports
import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

type Step = 'CONNECT' | 'SCAN' | 'METADATA' | 'UPLOADING' | 'SUCCESS';

interface Person {
  id: string;
  name: string;
}

function App() {
  const [step, setStep] = useState<Step>('CONNECT');
  const [familyKey, setFamilyKey] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  
  // Artifact Data
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Tagging
  const [tagScope, setTagScope] = useState<'FAMILY' | 'PERSON'>('FAMILY');
  const [selectedPersonId, setSelectedPersonId] = useState('');

  const handleConnect = async () => {
    if (familyKey.length < 6) return;
    setLoadingTree(true);
    try {
      const treeDoc = await getDoc(doc(db, "trees", familyKey));
      if (treeDoc.exists()) {
        const data = treeDoc.data();
        setPeople(data.people || []);
        setStep('SCAN');
      } else {
        alert("Family tree not found. Please check the key.");
      }
    } catch (e) {
      console.error("Error connecting:", e);
      alert("Failed to connect to database.");
    } finally {
      setLoadingTree(false);
    }
  };

  const handleScan = async (side: 'FRONT' | 'BACK') => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (side === 'FRONT') setFrontImage(image.dataUrl || null);
      else setBackImage(image.dataUrl || null);
    } catch (e) {
      console.error("Camera cancelled or failed", e);
    }
  };

  const handleUpload = async () => {
    if (!frontImage && !description.trim()) {
      alert("Please provide either a photo or a description.");
      return;
    }
    
    if (tagScope === 'PERSON' && !selectedPersonId) {
      alert("Please select a family member.");
      return;
    }

    setStep('UPLOADING');
    
    try {
      // The current web app expects "Text|DELIM|ImageData".
      const content = frontImage ? `${description}|DELIM|${frontImage}` : description;
      
      const newMemory = {
        id: Math.random().toString(36).substr(2, 9),
        type: frontImage ? 'image' : 'text',
        content: content,
        location,
        timestamp: new Date(date),
        tags: {
          isFamilyMemory: tagScope === 'FAMILY',
          personIds: tagScope === 'PERSON' ? [selectedPersonId] : []
        }
      };

      const treeRef = doc(db, "trees", familyKey);
      await updateDoc(treeRef, {
        memories: arrayUnion(newMemory)
      });
      
      setStep('SUCCESS');
    } catch (e) {
      console.error("Upload failed:", e);
      alert("Failed to upload artifact.");
      setStep('METADATA');
    }
  };

  const resetScanner = () => {
    setFrontImage(null);
    setBackImage(null);
    setDescription('');
    setLocation('');
    setStep('SCAN');
  };

  // --- UI SCREENS ---

  if (step === 'CONNECT') {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white p-4">
        <div className="mb-4 text-center">
          <h1 className="display-4">Artifact Scanner</h1>
          <p className="text-muted">Digitize your family history</p>
        </div>
        <div className="w-100" style={{maxWidth: '350px'}}>
          <label className="form-label">Enter Family Key</label>
          <input 
            type="number" 
            className="form-control form-control-lg text-center mb-3 fw-bold" 
            placeholder="000000"
            value={familyKey}
            onChange={e => setFamilyKey(e.target.value)}
          />
          <button 
            className="btn btn-primary w-100 btn-lg"
            disabled={familyKey.length < 6 || loadingTree}
            onClick={handleConnect}
          >
            {loadingTree ? 'Connecting...' : 'Connect to Tree'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'SCAN') {
    return (
      <div className="d-flex flex-column h-100 bg-black text-white">
        <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
          <span className="fw-bold text-success">● Connected: {familyKey}</span>
          <button className="btn btn-sm btn-outline-light" onClick={() => setStep('METADATA')}>
            Next: Details →
          </button>
        </div>
        
        <div className="flex-grow-1 p-3 overflow-auto">
          <div className="mb-4">
            <label className="text-muted mb-2 small text-uppercase fw-bold">Side A: Main Image</label>
            <div 
              className="card bg-dark border-secondary d-flex justify-content-center align-items-center" 
              style={{height: '250px', borderStyle: 'dashed', cursor: 'pointer', overflow: 'hidden'}}
              onClick={() => handleScan('FRONT')}
            >
              {frontImage ? (
                <img src={frontImage} alt="Front" className="w-100 h-100 object-fit-contain" />
              ) : (
                <div className="text-center text-muted">
                  <div className="display-1">+</div>
                  <div>Tap to Scan Front</div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-muted mb-2 small text-uppercase fw-bold">Side B: Notes / Back (Optional)</label>
            <div 
              className="card bg-dark border-secondary d-flex justify-content-center align-items-center" 
              style={{height: '150px', borderStyle: 'dashed', cursor: 'pointer', overflow: 'hidden'}}
              onClick={() => handleScan('BACK')}
            >
              {backImage ? (
                <img src={backImage} alt="Back" className="w-100 h-100 object-fit-contain" />
              ) : (
                <div className="text-center text-muted">
                  <div className="h3">+</div>
                  <div>Tap to Scan Back</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'METADATA') {
    return (
      <div className="d-flex flex-column h-100 bg-white">
        <div className="p-3 border-bottom bg-light d-flex justify-content-between">
          <h5 className="mb-0">Add Details</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setStep('SCAN')}>Back</button>
        </div>
        <div className="p-4 flex-grow-1 overflow-auto">
           {/* WHO TAGGING */}
           <div className="mb-4 p-3 bg-light rounded border">
                <label className="form-label fw-bold">Who is this for?</label>
                <div className="d-flex gap-3 mb-3">
                    <div className="form-check">
                        <input className="form-check-input" type="radio" name="tagScope" id="tagFamily" checked={tagScope === 'FAMILY'} onChange={() => setTagScope('FAMILY')} />
                        <label className="form-check-label" htmlFor="tagFamily">Family Bank</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="radio" name="tagScope" id="tagPerson" checked={tagScope === 'PERSON'} onChange={() => setTagScope('PERSON')} />
                        <label className="form-check-label" htmlFor="tagPerson">Specific Person</label>
                    </div>
                </div>
                
                {tagScope === 'PERSON' && (
                    <select 
                        className="form-select border-2" 
                        value={selectedPersonId} 
                        onChange={(e) => setSelectedPersonId(e.target.value)}
                        required
                    >
                        <option value="">Select family member...</option>
                        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )}
           </div>

           <div className="mb-3">
             <label className="form-label fw-bold">Description / Story (Optional)</label>
             <textarea 
               className="form-control" 
               rows={4} 
               placeholder="What is happening in this photo?"
               value={description}
               onChange={e => setDescription(e.target.value)}
             ></textarea>
           </div>
           
           <div className="row">
             <div className="col-6 mb-3">
               <label className="form-label fw-bold">Date</label>
               <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
             </div>
             <div className="col-6 mb-3">
               <label className="form-label fw-bold">Location</label>
               <input type="text" className="form-control" placeholder="Place" value={location} onChange={e => setLocation(e.target.value)} />
             </div>
           </div>
        </div>
        <div className="p-3 border-top">
          <button className="btn btn-success w-100 btn-lg" onClick={handleUpload}>
            Upload Artifact
          </button>
        </div>
      </div>
    );
  }

  if (step === 'UPLOADING' || step === 'SUCCESS') {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white text-center p-5">
        {step === 'UPLOADING' ? (
          <>
            <div className="spinner-border text-primary mb-4" role="status"></div>
            <h3>Digitizing...</h3>
            <p className="text-muted">Sending to the Murray Archive.</p>
          </>
        ) : (
          <>
            <div className="display-1 text-success mb-3">✓</div>
            <h2 className="mb-3">Successfully Archived</h2>
            <button className="btn btn-outline-primary btn-lg mt-4" onClick={resetScanner}>
              Scan Next Artifact
            </button>
          </>
        )}
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default App;