import React from "react";

class CreateGroupOrderPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canteens: [],
      selectedCanteen: "",
      isLoading: false,
      newGroupOrderDetails: null,
      token: "your-auth-token-here", // replace with real token
    };
  }

  componentDidMount() {
    // Normally you'd check authentication here
    this.fetchCanteens();
  }

  fetchCanteens = async () => {
    try {
      const res = await fetch(
        "https://cbbackend-kvp6.onrender.com/api/v1/canteens",
        {
          headers: { Authorization: `Bearer ${this.state.token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch canteens");

      const data = await res.json();
      this.setState({
        canteens: data.canteens || [],
        selectedCanteen:
          data.canteens.length > 0 ? data.canteens[0]._id : "",
      });
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  handleCreateGroupOrder = async () => {
    const { selectedCanteen, token } = this.state;

    if (!selectedCanteen) {
      alert("Please select a canteen first");
      return;
    }

    this.setState({ isLoading: true });

    try {
      const res = await fetch(
        "https://cbbackend-kvp6.onrender.com/api/v1/groupOrder/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ canteen: selectedCanteen }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create group order");
      }

      const data = await res.json();
      this.setState({ newGroupOrderDetails: data.data });
      alert("Group Order Created! Share the link or QR code with friends.");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  copyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  render() {
    const {
      canteens,
      selectedCanteen,
      isLoading,
      newGroupOrderDetails,
    } = this.state;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md border border-gray-700 bg-gray-800 shadow-xl rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center text-red-500 mb-6">
            Start a New Group Order
          </h1>

          {!newGroupOrderDetails ? (
            <div className="space-y-6">
              {/* Select Canteen */}
              <div>
                <label
                  htmlFor="canteen-select"
                  className="block text-gray-300 mb-2"
                >
                  Select Canteen
                </label>
                <select
                  id="canteen-select"
                  value={selectedCanteen}
                  onChange={(e) =>
                    this.setState({ selectedCanteen: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-700 text-gray-200 border border-gray-600"
                >
                  {canteens.map((canteen) => (
                    <option key={canteen._id} value={canteen._id}>
                      {canteen.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Create Button */}
              <button
                onClick={this.handleCreateGroupOrder}
                disabled={isLoading || !selectedCanteen}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
              >
                {isLoading ? "Creating..." : "Create Group Order"}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-green-400">
                Group Order Created! 🎉
              </h2>
              <p className="text-gray-300">
                Share this with your friends to join:
              </p>

              {/* QR Code */}
              {newGroupOrderDetails.qrCodeUrl && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="p-4 bg-white rounded-lg shadow-lg">
                    <img
                      src={newGroupOrderDetails.qrCodeUrl}
                      alt="Group Order QR Code"
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    Scan QR code to join
                  </p>
                </div>
              )}

              {/* Group Link */}
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 break-words">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Group Link:
                </label>
                <div className="bg-gray-800 p-3 rounded border border-gray-600 mb-3">
                  <p className="text-red-400 font-mono text-sm break-all">
                    {`https://campusbites-mxpe.onrender.com/group-order?link=${newGroupOrderDetails.groupLink}`}
                  </p>
                </div>
                <button
                  onClick={() =>
                    this.copyLink(
                      `https://campusbites-mxpe.onrender.com/group-order?link=${newGroupOrderDetails.groupLink}`
                    )
                  }
                  className="w-full border border-gray-600 text-gray-200 py-2 rounded hover:bg-gray-600"
                >
                  Copy Link
                </button>
              </div>

              {/* Go to Group Order Page */}
              <button
                onClick={() =>
                  (window.location.href = `/group-order?link=${newGroupOrderDetails.groupLink}`)
                }
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
              >
                Go to Group Order Page →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CreateGroupOrderPage;
