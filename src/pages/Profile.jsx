import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { refreshAccessToken, isTokenExpired } from "../utils/auth";
import { FaUser, FaLock } from 'react-icons/fa';


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
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [editData, setEditData] = useState({
		username: "",
		email: "",
		newPassword: "",
		confirmPassword: "",
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
				newPassword: "",
				confirmPassword: "",
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
	};

	useEffect(() => {
		const hasUsernameChanged = editData.username !== userData.username;
		const hasEmailChanged = editData.email !== userData.email;
		setHasChanges(hasUsernameChanged || hasEmailChanged);
	}, [editData, userData]);

	const handleProfileSubmit = async (e) => {
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

			// Check if token is expired and refresh if needed
			const token = localStorage.getItem('accessToken');
			if (isTokenExpired(token)) {
				await refreshAccessToken();
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
			setEditData(prev => ({
				...prev,
				username: response.data.data.username,
				email: response.data.data.email,
				// Preserve the password fields
				newPassword: prev.newPassword,
				confirmPassword: prev.confirmPassword
			}));
			setSuccessMessage("Profile updated successfully!");
			setHasChanges(false);
		} catch (err) {
			console.error("Update error:", err);
			if (err.response?.status === 401 && err.response?.data?.error?.message === "Token Expired") {
				try {
					await refreshAccessToken();
					// Retry the update after token refresh
					handleProfileSubmit(e);
					return;
				} catch (refreshError) {
					setErrorMessage("Session expired. Please login again.");
					setTimeout(() => {
						window.location.href = "/login";
					}, 2000);
				}
			} else {
				setErrorMessage(err.response?.data?.error?.message || "Failed to update profile!");
			}
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit = async (e) => {
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

			// Check if token is expired and refresh if needed
			const token = localStorage.getItem('accessToken');
			if (isTokenExpired(token)) {
				await refreshAccessToken();
			}

			if (editData.newPassword !== editData.confirmPassword) {
				setError("New passwords do not match");
				setLoading(false);
				return;
			}

			// Password validation (copied from Register.jsx)
			const password = editData.newPassword;
			const minLength = 8;
			const hasUpperCase = /[A-Z]/.test(password);
			const hasLowerCase = /[a-z]/.test(password);
			const hasNumbers = /\d/.test(password);
			const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

			if (password.length < minLength) {
				setError(`Password must be at least ${minLength} characters long to meet security standards.`);
				setLoading(false);
				return;
			}
			if (!hasUpperCase) {
				setError("Password must include at least one uppercase letter.");
				setLoading(false);
				return;
			}
			if (!hasLowerCase) {
				setError("Password must include at least one lowercase letter.");
				setLoading(false);
				return;
			}
			if (!hasNumbers) {
				setError("Password must include at least one numeric digit.");
				setLoading(false);
				return;
			}
			if (!hasSpecialChar) {
				setError("Password must include at least one special character.");
				setLoading(false);
				return;
			}

			const response = await axiosInstance.patch(`/user/${id}`, {
				password: editData.newPassword
			});

			if (response.data.error) {
				setError(response.data.error.message);
				return;
			}

			setEditData(prev => ({
				...prev,
				newPassword: "",
				confirmPassword: "",
			}));
			setShowPasswordForm(false);
			setSuccessMessage("Password updated successfully!");
		} catch (err) {
			console.error("Update error:", err);
			if (err.response?.status === 401 && err.response?.data?.error?.message === "Token Expired") {
				try {
					await refreshAccessToken();
					// Retry the password update after token refresh
					handlePasswordSubmit(e);
					return;
				} catch (refreshError) {
					setErrorMessage("Session expired. Please login again.");
					setTimeout(() => {
						window.location.href = "/login";
					}, 2000);
				}
			} else {
				setErrorMessage(err.response?.data?.error?.message || "Failed to update password!");
			}
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
				<form onSubmit={handleProfileSubmit} className="space-y-6">
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
							className={`update-user-cancel-button ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
						>
							{loading ? "Saving..." : "Update Profile"}
						</button>
						<button
							type="button"
							onClick={() => setShowPasswordForm(!showPasswordForm)}
							className="update-user-cancel-button"
						>
							{showPasswordForm ? "Cancel Password Change" : "Change Password"}
						</button>
					</div>
				</form>

				{showPasswordForm && (
					<form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
						<div className="update-user-row">
							<FaLock className="update-user-icon-style" />
							<h2 className="update-user-label-text">Change Password</h2>
						</div>
						<div className="update-user-grid-3-cols">
							<label className="update-user-text-sm-medium">New Password</label>
							<input
								type="password"
								name="newPassword"
								value={editData.newPassword}
								onChange={handleEditChange}
								className="update-user-input-field"
								placeholder="Enter new password"
							/>
						</div>
						<div className="update-user-grid-3-cols">
							<label className="update-user-text-sm-medium">Confirm New Password</label>
							<input
								type="password"
								name="confirmPassword"
								value={editData.confirmPassword}
								onChange={handleEditChange}
								className="update-user-input-field"
								placeholder="Confirm new password"
							/>
						</div>
						{error && (
							<div className="update-user-error-alert">{error}</div>
						)}
						<div className="flex justify-end pt-6">
							<button
								type="submit"
								disabled={loading || !editData.newPassword || !editData.confirmPassword}
								className={`update-user-cancel-button ${(!editData.newPassword || !editData.confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								{loading ? "Saving..." : "Update Password"}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
