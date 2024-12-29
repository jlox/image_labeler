import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

let PRESET_IMAGES = [
  {
    id: 1,
    title: 'Mountain Landscape',
    src: null,
  },
];

const ImageSelector = (props) => {
  // const [whiteboards, setWhiteboards] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(PRESET_IMAGES[0].id);
  const [selections, setSelections] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSelection, setCurrentSelection] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [editingField, setEditingField] = useState(null);
  const containerRef = useRef(null);
  const [user, setUser] = useState('')

  useEffect(() => {
    fetchWhiteboards()
    // PRESET_IMAGES = 
  }, [])
  useEffect(() => {
    fetchSelections(props.user, selectedImageId);
  }, [selectedImageId]);

  interface Image {
    id: string;
    title: string;
    src: string;
  };

  const fetchWhiteboards = async () => {
    try {
      const response = await fetch('http://localhost:8000/whiteboards');
      const data = await response.json();
      // setWhiteboards(data.whiteboards)
      PRESET_IMAGES = data.whiteboards.map(datum =>  {
        return {
          id: datum.image_id,
          title: datum.image_id,
          src: datum.image_url
        }
      })
      setSelectedImageId(data.whiteboards[0].image_id);
    } catch (error) {
      console.error('Error fetching whiteboards:', error);
    }
  };

  const fetchSelections = async (userId, imageId) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}/image/${imageId}/selections`);
      // const response = await fetch('http://localhost:8000/selections')
      const data = await response.json();
      setSelections(prev => ({ ...prev, ...data.selections }));
    } catch (error) {
      console.error('Error fetching selections:', error);
    }
  };

  const saveSelections = async (imageId: string, selectionsList) => {
    console.log('imageId: ', imageId)
    console.log('selectionsList: ', selectionsList)
    try {
      const selectedImage = PRESET_IMAGES.find(img => img.id === imageId);
      console.log('selectedImage: ', selectedImage)
      await fetch('http://localhost:8000/save-selections/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: imageId,
          image_name: selectedImage.title,
          selections: selectionsList[imageId],
        }),
      });
      toast("Saved!");
    } catch (error) {
      console.error('Error saving selections:', error);
    }
  };

  const handleDeleteSelection = (indexToDelete) => {
    const updatedSelections = (selections[selectedImageId] || []).filter((_, index) => index !== indexToDelete);
    setSelections(prev => ({
      ...prev,
      [selectedImageId]: updatedSelections
    }));
    saveSelections(selectedImageId, {...selections, [selectedImageId]: updatedSelections});
  };

  // ... (previous mouse handling functions remain the same)
  const handleMouseDown = (e) => {
    const { x, y } = getMousePosition(e);
    setIsDrawing(true);
    setCurrentSelection({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getMousePosition(e);
    setCurrentSelection(prev => ({
      ...prev,
      width: x - prev.x,
      height: y - prev.y
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentSelection.width && currentSelection.height) {
      const normalized = {
        x: currentSelection.width > 0 ? currentSelection.x : currentSelection.x + currentSelection.width,
        y: currentSelection.height > 0 ? currentSelection.y : currentSelection.y + currentSelection.height,
        width: Math.abs(currentSelection.width),
        height: Math.abs(currentSelection.height),
        transcription: '',
        confidence: '',
        user: props.user,
        image_name: PRESET_IMAGES.find(img => img.id === selectedImageId).title,
        image_url: PRESET_IMAGES.find(img => img.id === selectedImageId).src,
        timestamp: new Date(),
      };
      
      const updatedSelections = [...(selections[selectedImageId] || []), normalized];
      setSelections(prev => ({
        ...prev,
        [selectedImageId]: updatedSelections
      }));
      // saveSelections(selectedImageId, updatedSelections);
    }
  };

  const getMousePosition = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleFieldChange = (index, field, value) => {
    const updatedSelections = [...(selections[selectedImageId] || [])];
    updatedSelections[index] = { ...updatedSelections[index], [field]: value };
    setSelections(prev => ({
      ...prev,
      [selectedImageId]: updatedSelections
    }));
    // saveSelections(selectedImageId, updatedSelections);
    setEditingField(null);
  };

  const handleImageSelect = (imageId) => {
    setSelectedImageId(imageId);
    setEditingField(null);
  };
  const preventDragHandler = (e) => {
    e.preventDefault();
  }

  const currentSelectionsList = selections[selectedImageId] || [];
  const selectedImage = PRESET_IMAGES.find(img => img.id === selectedImageId);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Image selector and main image container remain the same */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Image Selection Tool</h2>
        <p className="text-gray-600">Choose an image and click and drag to select areas</p>
      </div>

      <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
        {PRESET_IMAGES.map((image) => (
          <button
            key={image.id}
            onClick={() => handleImageSelect(image.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              selectedImageId === image.id 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-24 h-16 object-cover rounded"
            />
            <span className="mt-1 text-sm font-medium">{image.title}</span>
          </button>
        ))}
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full h-96 border-2 border-gray-300 rounded-lg overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        // draggable={false}
        onDragStart={preventDragHandler}
      >
        <img 
          src={selectedImage.src}
          alt={selectedImage.title}
          className="w-full h-full object-contain"
        />
        
        {currentSelectionsList.map((selection, index) => {
          return selection.user === props.user ?
          (
          <div
            key={index}
            className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30"
            style={{
              left: `${selection.x}px`,
              top: `${selection.y}px`,
              width: `${selection.width}px`,
              height: `${selection.height}px`
            }}
          />
          ) :
          (
            <div>
            </div>
          )
        })}
        
        {isDrawing && (
          <div
            className="absolute border-2 border-red-500 bg-red-200 bg-opacity-30"
            style={{
              left: `${currentSelection.x}px`,
              top: `${currentSelection.y}px`,
              width: `${currentSelection.width}px`,
              height: `${currentSelection.height}px`
            }}
          />
        )}
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Selected Areas in {selectedImage.title}:</h3>
        {currentSelectionsList.length === 0 ? (
          <p className="text-gray-500">No areas selected yet</p>
        ) : (
          <ul className="space-y-4">
            {currentSelectionsList.map((selection, index) => {
              return selection.user === props.user ? (
              <li key={index} className="bg-white p-4 rounded-lg shadow-sm relative">
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteSelection(index)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                  title="Delete selection"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="text-sm text-gray-600 mb-2">
                  Area {index + 1}: ({Math.round(selection.x)}, {Math.round(selection.y)}) - 
                  {Math.round(selection.width)}x{Math.round(selection.height)}
                </div>
                
                <div className="space-y-2">
                  {/* Transcription field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transcription:</label>
                      <input
                        type="text"
                        value={selection.transcription || ''}
                        onChange={(e) => handleFieldChange(index, 'transcription', e.target.value)}
                        autoFocus
                        className="mt-1 w-full p-2 border rounded"
                        placeholder="Enter transcription..."
                      />
                    
                  </div>

                  {/* Confidence field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confidence:</label>
                      <input
                        type="text"
                        value={selection.confidence || ''}
                        onChange={(e) => handleFieldChange(index, 'confidence', e.target.value)}
                        onBlur={() => setEditingField(null)}
                        autoFocus
                        className="mt-1 w-full p-2 border rounded"
                        placeholder="Enter confidence level..."
                      />
                  </div>
                </div>

                {/* Savebutton */}
                <button
                  onClick={() => saveSelections(selectedImage.title, selections)}
                  className="top-4 right-2 p-1 rounded"
                  title="Delete selection"
                >
                  Save
                </button>
                <ToastContainer />
              </li>
              ) : 
              (
                <div></div>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ImageSelector;