import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, ListGroup, Alert, Spinner, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [readings, setReadings] = useState([]);
  const [deviceName, setDeviceName] = useState("");
  const [readingValue, setReadingValue] = useState("");
  const [currentReading, setCurrentReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [matlabResult, setMatlabResult] = useState(null); // For MATLAB results

  useEffect(() => {
    fetchReadings();
    console.log(readings); // Check that readings get updated here
  }, []);

  const fetchReadings = async () => {
    setLoading(true);
    console.log(readings);
    try {
      const response = await axios.get("http://localhost:8000/api/device_readings/");
      setReadings(response.data);
    } catch (error) {
      setErrorMessage("There was an error fetching the data!");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithMatlab = async () => {
    setLoading(true);
    console.log(readings);
    try {
      const response = await axios.post("http://localhost:8000/api/process_matlab/", readings, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMatlabResult(response.data.result); // Store MATLAB result
      setSuccessMessage("Data processed successfully with MATLAB!");
    } catch (error) {
      setErrorMessage("There was an error processing the data with MATLAB!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const newReading = { device_name: deviceName, reading_value: readingValue };
      const response = await axios.post("http://localhost:8000/api/device_readings/", newReading);
      setReadings([...readings, response.data]);
      setSuccessMessage("Reading added successfully!");
      resetForm();
    } catch (error) {
      setErrorMessage("There was an error creating the reading!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const updatedReading = { device_name: deviceName, reading_value: readingValue };
      const response = await axios.put(`http://localhost:8000/api/device_readings/${currentReading.id}/`, updatedReading);
      setReadings(readings.map((reading) => (reading.id === currentReading.id ? response.data : reading)));
      setSuccessMessage("Reading updated successfully!");
      resetForm();
    } catch (error) {
      setErrorMessage("There was an error updating the reading!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await axios.delete(`http://localhost:8000/api/device_readings/${readingToDelete.id}/`);
      setReadings(readings.filter((reading) => reading.id !== readingToDelete.id));
      setSuccessMessage("Reading deleted successfully!");
    } catch (error) {
      setErrorMessage("There was an error deleting the reading!");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = (reading) => {
    setCurrentReading(reading);
    setDeviceName(reading.device_name);
    setReadingValue(reading.reading_value);
  };

  const resetForm = () => {
    setDeviceName("");
    setReadingValue("");
    setCurrentReading(null);
  };

  return (
    <div className="App container mt-5">
      <h1 className="text-center">Device Readings</h1>

      {loading && <Spinner animation="border" variant="primary" />}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <ListGroup className="mt-4">
        {readings.map((reading) => (
          <ListGroup.Item key={reading.id} className="d-flex justify-content-between align-items-center">
            {reading.device_name}: {reading.reading_value} at {reading.reading_time}
            <div>
              <Button className="me-2" variant="warning" onClick={() => handleEdit(reading)}>
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setReadingToDelete(reading);
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Form className="mt-4" onSubmit={currentReading ? handleUpdate : handleCreate}>
        <Form.Group controlId="formDeviceName">
          <Form.Label>Device Name</Form.Label>
          <Form.Control type="text" placeholder="Enter device name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="formReadingValue" className="mt-3">
          <Form.Label>Reading Value</Form.Label>
          <Form.Control type="text" placeholder="Enter reading value" value={readingValue} onChange={(e) => setReadingValue(e.target.value)} required />
        </Form.Group>

        <Button className="mt-3" variant="primary" type="submit">
          {currentReading ? "Update Reading" : "Add Reading"}
        </Button>
      </Form>

      <Button className="mt-3" variant="primary" onClick={handleProcessWithMatlab}>
        Process Data with MATLAB
      </Button>

      {matlabResult && (
        <div className="mt-4">
          <h3>MATLAB Processed Data:</h3>
          <pre>{JSON.stringify(matlabResult, null, 2)}</pre>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this reading?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
