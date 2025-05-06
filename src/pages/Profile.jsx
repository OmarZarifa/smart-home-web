import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { refreshAccessToken, isTokenExpired } from "../utils/auth";
import { FaUser } from 'react-icons/fa';


// get user ID from token
const getUserIdFromToken = () => {
	const token = localStorage.getItem('accessToken');
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload.user_id;
	} catch (error) {
		console.error('Error parsing token:', error);
		return null;
	}
};

export default function Profile() {
	const navigate = useNavigate();
	const [userData, setUserData] = useState({
		username: "",
		email: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState({
		username: "",
		email: "",
	});
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem('accessToken');
			if (!token) {
				setError("Please login to access your profile.");
				return;
			}

			// Check if token is expired
			if (isTokenExpired(token)) {
				try {
					// refresh the token
					await refreshAccessToken();
					// After refresh, get the user ID
					const id = getUserIdFromToken();
					if (!id) {
						setError("Invalid session. Please login again.");
						return;
					}

					fetchUserData(id);
				} catch (refreshError) {
					console.error("Token refresh failed:", refreshError);
					setError("Session expired. Please login again.");
					localStorage.removeItem("accessToken");
				}
			} else {
				// Token is valid, get user ID
				const id = getUserIdFromToken();
				if (!id) {
					setError("Invalid session. Please login again.");
					return;
				}

				fetchUserData(id);
			}
		};

		checkAuth();
	}, [navigate]);

	const fetchUserData = async (id) => {
		try {
			setLoading(true);
			const response = await axiosInstance.get(`/users/${id}`);
			if (response.data.error) {
				setError(response.data.error.message);
				return;
			}
			setUserData(response.data.data);
			setEditData({
				username: response.data.data.username,
				email: response.data.data.email,
			});
		} catch (err) {
			if (err.response?.status === 401) {
				// Token expired or invalid
				localStorage.removeItem("accessToken");
				setError("Session expired. Please login again.");
			} else {
				setError(err.response?.data?.error?.message || "Failed to fetch user data");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		setEditData(prev => ({
			...prev,
			[name]: value
		}));
		// Check if there are any changes
		const hasUsernameChanged = name === 'username' && value !== userData.username;
		const hasEmailChanged = name === 'email' && value !== userData.email;
		setHasChanges(hasUsernameChanged || hasEmailChanged);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");
		setErrorMessage("");
		setLoading(true);

		try {
			const id = getUserIdFromToken();
			if (!id) {
				setError("Invalid session. Please login again.");
				return;
			}

			// Only include fields that have been changed
			const updateData = {};
			if (editData.username !== userData.username) updateData.username = editData.username;
			if (editData.email !== userData.email) updateData.email = editData.email;

			if (Object.keys(updateData).length === 0) {
				setLoading(false);
				return;
			}

			const response = await axiosInstance.patch(`/user/${id}`, updateData);

			if (response.data.error) {
				setError(response.data.error.message);
				return;
			}

			setUserData(response.data.data);
			setEditData({
				username: response.data.data.username,
				email: response.data.data.email,
			});
			setIsEditing(false);
			setSuccessMessage("Profile updated successfully!");
			setHasChanges(false);
		} catch (err) {
			console.error("Update error:", err);
			setErrorMessage("Failed to update profile!")
			setError(err.response?.data?.error?.message || "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#76766b] dark:bg-gray-900">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dcdcd4] dark:border-gray-100"></div>
			</div>
		);
	}

	return (
		<div className="update-user-container">
			<div className="update-user-card">
				<div className="update-user-row">
					<FaUser className="update-user-icon-style" />
					<h2 className="update-user-label-text">User Information</h2>
				</div>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="update-user-grid-3-cols">
						<label className="update-user-text-sm-medium">Username</label>
						<input
							type="text"
							name="username"
							value={editData.username}
							onChange={handleEditChange}
							className="update-user-input-field"
						/>
					</div>
					<div className="update-user-grid-3-cols">
						<label className="update-user-text-sm-medium">Email</label>
						<input
							type="email"
							name="email"
							value={editData.email}
							onChange={handleEditChange}
							className="update-user-input-field"
						/>
					</div>
					{successMessage && (
						<div className="update-user-success-alert">
							{successMessage}
						</div>
					)}
					{errorMessage && (
						<div className="update-user-error-alert">
							{errorMessage}
						</div>
					)}

					<div className="flex justify-between pt-6">
						<button
							type="submit"
							disabled={loading || !hasChanges}
							className={`update-user-cancel-button ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''
								}`}
						>
							{loading ? "Saving..." : "Update"}
						</button>
						<button
							type="button"
							onClick={() => {
								setIsEditing(false);
								setEditData({
									username: userData.username,
									email: userData.email,
								});
							}}
							className="update-user-cancel-button"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
