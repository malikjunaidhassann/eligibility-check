import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    insuranceId: "",
    providerNPI: "",
    payerName: "",
  });
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update form data state when input fields change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEligibilityResult(null);

    try {
      const response = await axios.post(
        "https://api.redoxengine.com/fhir/R4/redox-fhir-sandbox/Development/Coverage/_search",
        {
          beneficiary: {
            identifier: {
              value: formData.insuranceId,
            },
            name: {
              given: [formData.firstName],
              family: formData.lastName,
            },
            birthDate: formData.dob,
          },
          provider: {
            identifier: {
              system: "urn:oid:2.16.840.1.113883.4.6",
              value: formData.providerNPI,
            },
          },
          payor: {
            name: formData.payerName,
          },
        },
        {
          headers: {
            Authorization: `Bearer YOUR_API_TOKEN`, // Replace with your actual Redox API token
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setEligibilityResult(response.data);
      } else {
        setError("No coverage data found for this patient.");
      }
    } catch (err) {
      setError("An error occurred while checking insurance eligibility.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Check Insurance Eligibility</h2>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Last Name:
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Date of Birth:
          <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
        </label>
        <br />
        <label>
          Insurance ID (Member Number):
          <input
            type="text"
            name="insuranceId"
            value={formData.insuranceId}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Provider NPI:
          <input
            type="text"
            name="providerNPI"
            value={formData.providerNPI}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Payer Name:
          <input
            type="text"
            name="payerName"
            value={formData.payerName}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Checking Eligibility..." : "Check Eligibility"}
        </button>
      </form>

      {eligibilityResult && (
        <div>
          <h3>Eligibility Result</h3>
          <pre>{JSON.stringify(eligibilityResult, null, 2)}</pre>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default App;
