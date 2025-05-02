import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Optional: for custom styles

// Validation schema
const schema = yup.object().shape({
  num_of_passengers: yup.number().required("Number of passengers is required").positive().integer(),
  amount_per_passenger: yup.number().required("Amount per passenger is required").positive(),
  from: yup.string().required("From location is required"),
  to: yup.string().required("To location is required"),
  company_id: yup.number().required("Company ID is required").positive().integer(),
  route_id: yup.number().required("Route ID is required").positive().integer(),
  file: yup.mixed().required("File is required")
});

const App = () => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const [companies, setCompanies] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesResponse = await axios.get('http://ec2-3-110-219-153.ap-south-1.compute.amazonaws.com/api/companies');
        const routesResponse = await axios.get('http://ec2-3-110-219-153.ap-south-1.compute.amazonaws.com/api/routes');
        setCompanies(companiesResponse.data);
        setRoutes(routesResponse.data);
      } catch (error) {
        toast.error('Error fetching companies and routes');
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('num_of_passengers', data.num_of_passengers);
    formData.append('amount_per_passenger', data.amount_per_passenger);
    formData.append('from', data.from);
    formData.append('to', data.to);
    formData.append('company_id', data.company_id);
    formData.append('route_id', data.route_id);

    try {
      const response = await axios.post('http://3.7.46.71:9000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Upload successful!');
      reset();
      setPreview(null);
      window.location.reload(); // Reload the page after success
    } catch (error) {
      toast.error('Upload failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <ToastContainer />
      <h2>Upload Trip</h2>

      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <div className="form-group">
          <label>Number of Passengers:</label>
          <Controller
            name="num_of_passengers"
            control={control}
            render={({ field }) => <input {...field} type="number" className="input-field" />}
          />
          {errors.num_of_passengers && <p className="error-message">{errors.num_of_passengers.message}</p>}
        </div>

        <div className="form-group">
          <label>Amount per Passenger:</label>
          <Controller
            name="amount_per_passenger"
            control={control}
            render={({ field }) => <input {...field} type="number" className="input-field" />}
          />
          {errors.amount_per_passenger && <p className="error-message">{errors.amount_per_passenger.message}</p>}
        </div>

        <div className="form-group">
          <label>From Location:</label>
          <Controller
            name="from"
            control={control}
            render={({ field }) => <input {...field} className="input-field" />}
          />
          {errors.from && <p className="error-message">{errors.from.message}</p>}
        </div>

        <div className="form-group">
          <label>To Location:</label>
          <Controller
            name="to"
            control={control}
            render={({ field }) => <input {...field} className="input-field" />}
          />
          {errors.to && <p className="error-message">{errors.to.message}</p>}
        </div>

        <div className="form-group">
          <label>Company:</label>
          <Controller
            name="company_id"
            control={control}
            render={({ field }) => (
              <select {...field} className="select-field">
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.company_id && <p className="error-message">{errors.company_id.message}</p>}
        </div>

        <div className="form-group">
          <label>Route:</label>
          <Controller
            name="route_id"
            control={control}
            render={({ field }) => (
              <select {...field} className="select-field">
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.bus_num}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.route_id && <p className="error-message">{errors.route_id.message}</p>}
        </div>

        <div className="form-group">
          <label>Upload Image:</label>
          <Controller
            name="file"
            control={control}
            render={({ field: { onChange } }) => (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  onChange(file);
                  setPreview(URL.createObjectURL(file));
                }}
                className="input-field"
              />
            )}
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" height="100" />
            </div>
          )}
          {errors.file && <p className="error-message">{errors.file.message}</p>}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default App;
