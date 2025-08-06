import React, { useEffect, useState } from "react";
import { FaLaptop } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL;

const AssetsTab = ({ employee, user }) => {
    console.log("AssetsTab user:", user);
    
  const [assets, setAssets] = useState([]);
  const [assetCategory, setAssetCategory] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [dateAssigned, setDateAssigned] = useState("");
  const [dateReturned, setDateReturned] = useState("");

  const [editingAsset, setEditingAsset] = useState(null);

  const fetchAssets = async () => {
    try {
      const res = await fetch(`${API_URL}/employees/${employee.id}/assets`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      toast.error("Error fetching assets");
    }
  };

  useEffect(() => {
    if (employee.id) {
      fetchAssets();
    }
  }, [employee.id]);

  const resetForm = () => {
    setAssetCategory("");
    setAssetDescription("");
    setSerialNumber("");
    setDateAssigned("");
    setDateReturned("");
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const newAsset = {
      asset_category: assetCategory,
      asset_description: assetDescription,
      serial_number: serialNumber,
      date_assigned: dateAssigned,
      date_returned: dateReturned || null,
    };

    try {
      const res = await fetch(`${API_URL}/employees/${employee.id}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsset),
      });

      if (!res.ok) throw new Error();

      await fetchAssets();
      resetForm();
      toast.success("Asset added successfully!");
    } catch (err) {
      toast.error("Failed to add asset.");
    }
  };

  const handleDeleteAsset = async (id) => {
    try {
      const res = await fetch(`${API_URL}/assets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchAssets();
      toast.success("Asset deleted.");
    } catch (err) {
      toast.error("Failed to delete asset.");
    }
  };

  const handleEditClick = (asset) => {
    setEditingAsset(asset);
    setAssetCategory(asset.asset_category);
    setAssetDescription(asset.asset_description);
    setSerialNumber(asset.serial_number);
    setDateAssigned(asset.date_assigned.split("T")[0]);
    setDateReturned(asset.date_returned ? asset.date_returned.split("T")[0] : "");
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    if (!editingAsset) return;

    const updatedAsset = {
      asset_category: assetCategory,
      asset_description: assetDescription,
      serial_number: serialNumber,
      date_assigned: dateAssigned,
      date_returned: dateReturned || null,
    };

    try {
      const res = await fetch(`${API_URL}/assets/${editingAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAsset),
      });

      if (!res.ok) throw new Error();

      toast.success("Asset updated.");
      setEditingAsset(null);
      resetForm();
      fetchAssets();
    } catch (err) {
      toast.error("Failed to update asset.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">
          <FaLaptop className="text-olivegreen" /> Assets
        </h3>

        <form
          onSubmit={handleAddAsset}
          className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <select
            value={assetCategory}
            onChange={(e) => setAssetCategory(e.target.value)}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="Computer">Computer</option>
            <option value="Monitor">Monitor</option>
            <option value="Hardware">Hardware</option>
            <option value="Cellphone">Cellphone</option>
            <option value="Corporate Card">Corporate Card</option>
            <option value="Software">Software</option>
          </select>

          <input
            type="text"
            placeholder="Description"
            value={assetDescription}
            onChange={(e) => setAssetDescription(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={dateAssigned}
            onChange={(e) => setDateAssigned(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <input
            type="date"
            value={dateReturned}
            onChange={(e) => setDateReturned(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            type="submit"
            className="bg-[#6a8932] text-white px-4 py-2 rounded"
          >
            Add Asset
          </button>
        </form>

        {assets.length === 0 ? (
          <p className="text-gray-600">No assets assigned.</p>
        ) : (
          <ul className="space-y-2">
            {assets.map((a) => (
              <li
                key={a.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <div>
                  <p className="font-medium">
                    {a.asset_category}: {a.asset_description}
                  </p>
                  <p className="text-sm text-gray-500">Serial: {a.serial_number}</p>
                  <p className="text-sm text-gray-500">
                    Assigned: {new Date(a.date_assigned).toLocaleDateString()} | Returned:{" "}
                    {a.date_returned
                      ? new Date(a.date_returned).toLocaleDateString()
                      : "Not yet returned"}
                  </p>
                </div>

                {user?.role === "admin" && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEditClick(a)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(a.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Edit Modal */}
        {editingAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Edit Asset</h2>
              <form onSubmit={handleUpdateAsset} className="space-y-3">
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Computer">Computer</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Cellphone">Cellphone</option>
                  <option value="Corporate Card">Corporate Card</option>
                  <option value="Software">Software</option>
                </select>
                <input
                  type="text"
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Description"
                  required
                />
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Serial Number"
                />
                <input
                  type="date"
                  value={dateAssigned}
                  onChange={(e) => setDateAssigned(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="date"
                  value={dateReturned}
                  onChange={(e) => setDateReturned(e.target.value)}
                  className="border p-2 rounded w-full"
                />

                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAsset(null);
                      resetForm();
                    }}
                    className="text-gray-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsTab;
