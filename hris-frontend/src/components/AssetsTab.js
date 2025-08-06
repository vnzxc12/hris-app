import React, { useEffect, useState } from "react";
import { FaLaptop } from "react-icons/fa";

const AssetsTab = ({ employee }) => {
  const [assets, setAssets] = useState([]);
  const [assetCategory, setAssetCategory] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [dateAssigned, setDateAssigned] = useState("");
  const [dateReturned, setDateReturned] = useState("");

  useEffect(() => {
    fetch(`/employees/${employee.id}/assets`)
      .then((res) => res.json())
      .then((data) => setAssets(data));
  }, [employee.id]);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const newAsset = {
      asset_category: assetCategory,
      asset_description: assetDescription,
      serial_number: serialNumber,
      date_assigned: dateAssigned,
      date_returned: dateReturned || null,
    };

    const res = await fetch(`/employees/${employee.id}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAsset),
    });

    if (res.ok) {
      const added = await res.json();
      setAssets([...assets, { id: added.asset_id, ...newAsset }]);
      setAssetCategory("");
      setAssetDescription("");
      setSerialNumber("");
      setDateAssigned("");
      setDateReturned("");
    }
  };

  const handleDeleteAsset = async (id) => {
    const res = await fetch(`/assets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAssets(assets.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">
          <FaLaptop className="text-olivegreen" />Assets
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
                <button
                  onClick={() => handleDeleteAsset(a.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssetsTab;
