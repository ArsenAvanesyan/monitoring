import React from 'react';
import { UserIcon } from '../svg/icons';

const Profile = () => {
  // Пример данных пользователя (можно заменить на реальные данные из API)
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    joinDate: '2024-01-15',
    avatar: 'JD',
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto text-primary">
        <h1 className="text-3xl font-bold mb-2">Personal Account</h1>
        <p className="text-base-content/70 mb-8">Manage your account settings and preferences</p>

        {/* Profile Card */}
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex items-center gap-6 mb-6">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-24">
                  <span className="text-3xl font-semibold">{userData.avatar}</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <p className="text-base-content/70">{userData.role}</p>
              </div>
            </div>

            <div className="divider"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Full Name</span>
                </label>
                <input
                  type="text"
                  value={userData.name}
                  className="input input-info input-bordered w-full bg-base-100"
                  readOnly
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="email"
                  value={userData.email}
                  className="input input-info input-bordered w-full bg-base-100"
                  readOnly
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Role</span>
                </label>
                <input
                  type="text"
                  value={userData.role}
                  className="input input-info input-bordered w-full bg-base-100"
                  readOnly
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Member Since</span>
                </label>
                <input
                  type="text"
                  value={new Date(userData.joinDate).toLocaleDateString()}
                  className="input input-info input-bordered w-full bg-base-100"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="btn btn-info">
                Edit Profile
              </button>
              <button className="btn btn-info">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4">Account Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <p className="font-semibold">Email Notifications</p>
                  <p className="text-sm text-base-content/70">Receive email notifications about important events</p>
                </div>
                <input type="checkbox" className="toggle toggle-info input-info" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <p className="font-semibold">SMS Notifications</p>
                  <p className="text-sm text-base-content/70">Receive SMS alerts for critical issues</p>
                </div>
                <input type="checkbox" className="toggle toggle-info input-info" />
              </div>

              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                  <p className="font-semibold">Two-Factor Authentication</p>
                  <p className="text-sm text-base-content/70">Add an extra layer of security to your account</p>
                </div>
                <input type="checkbox" className="toggle toggle-info input-info" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

