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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReadings, setSelectedReadings] = useState([]);

  const filteredReadings = readings.filter((reading) => reading.device_name.toLowerCase().includes(searchTerm.toLowerCase()));
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
    const readingsToProcess = readings.filter((reading) => selectedReadings.includes(reading.id)); // Get selected readings
    try {
      const response = await axios.post("http://localhost:8000/api/process_matlab/", readingsToProcess, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setMatlabResult(response.data.result); // Store MATLAB result
      console.log(response.data.result);
      setSuccessMessage("Data processed successfully with MATLAB!");
      setSelectedReadings([]);
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
    <div className="App container mt-5" style={{ maxWidth: "800px" }}>
      <h1 className="text-center">Device Readings</h1>

      {loading && <Spinner animation="border" variant="primary" />}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <div className="mb-3">
        <input type="text" className="form-control" placeholder="Search for a device..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        <ListGroup className="mt-4">
          {filteredReadings.map((reading) => (
            <ListGroup.Item key={reading.id} className="d-flex justify-content-between align-items-center">
              <Form.Check
                type="checkbox"
                checked={selectedReadings.includes(reading.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedReadings((prev) => [...prev, reading.id]); // Add the reading ID
                  } else {
                    setSelectedReadings((prev) => prev.filter((id) => id !== reading.id)); // Remove the reading ID
                  }
                }}
              />
              <span>
                {reading.device_name}: {reading.reading_value} at {reading.reading_time}
              </span>
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
      </div>
      <div>
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

            {/* Mean Values Table */}
            <h4>Mean Values</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Mean Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(matlabResult.mean_values).length > 0 ? (
                  Object.entries(matlabResult.mean_values).map(([sensor, value], index) => (
                    <tr key={index}>
                      <td>{sensor}</td>
                      <td>{value}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No mean values available</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Median Values Table */}
            <h4>Median Values</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Median Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(matlabResult.median_values).length > 0 ? (
                  Object.entries(matlabResult.median_values).map(([sensor, value], index) => (
                    <tr key={index}>
                      <td>{sensor}</td>
                      <td>{value}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No median values available</td>
                  </tr>
                )}
              </tbody>
            </table>
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
    </div>
  );
}

export default App;
