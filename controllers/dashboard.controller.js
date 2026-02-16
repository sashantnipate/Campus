const Event = require('../models/event.model'); 
const Organization = require('../models/organization.model');
const IssuedCertificate = require('../models/issuedCertificate.model');

// --- Helper: Generate 7-Day Sparkline Data ---
// Takes a Mongoose Model and returns an array of counts for the last 7 days
async function getSparklineData(model) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const data = await model.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Create an array of 0s for the last 7 days, filling in real data where it exists
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    const found = data.find(item => item._id === dateString);
    result.push(found ? found.count : 0);
  }
  return result;
}

// --- 1. GET DASHBOARD STATS (Cards) ---
exports.getDashboardStats = async (req, res) => {
  try {
    // A. Fetch Basic Counts
    const totalEvents = await Event.countDocuments();
    const activeOrgs = await Organization.countDocuments(); // "Active Organizers" based on Organization model
    const pendingApprovals = await Event.countDocuments({ status: 'Pending' });
    const totalCertificates = await IssuedCertificate.countDocuments(); 

    // B. Generate Sparklines (Activity over last 7 days)
    const eventTrend = await getSparklineData(Event);
    const certTrend = await getSparklineData(IssuedCertificate);

    // C. Calculate Trends (Simple logic: compare last 2 days)
    // You can make this more complex, but this is fast and effective
    const eventGrowth = eventTrend[6] >= eventTrend[5] ? 'up' : 'down';
    const certGrowth = certTrend[6] >= certTrend[5] ? 'up' : 'down';

    // D. Construct Response Object
    const stats = [
      {
        title: 'Total Events',
        value: totalEvents,
        interval: 'Last 7 Days',
        trend: eventGrowth,
        data: eventTrend
      },
      {
        title: 'Active Organizations',
        value: activeOrgs,
        interval: 'Registered Org.',
        trend: 'neutral',
        data: [1, 1, 1, 2, 2, 2, 2] // Placeholder or implement User/Org creation tracking
      },
      {
        title: 'Pending Approvals',
        value: pendingApprovals,
        interval: 'Requires Action',
        trend: pendingApprovals > 0 ? 'down' : 'neutral', // Red warning if tasks exist
        data: [0, 0, 0, 0, 0, pendingApprovals, pendingApprovals] 
      },
      {
        title: 'Certificates Issued',
        value: totalCertificates,
        interval: 'Total Distributed',
        trend: certGrowth,
        data: certTrend
      }
    ];

    res.status(200).json({ success: true, stats });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- 2. GET EVENTS TABLE DATA ---
exports.getEventsTable = async (req, res) => {
  try {
    // Fetch events sorted by creation (newest first) or start date
    const events = await Event.find()
      .select('title category department location startDate status') // Only fetch needed fields
      .sort({ createdAt: -1 });

    // Format for Frontend DataGrid
    const tableData = events.map(event => ({
      id: event._id,
      title: event.title,
      category: event.category,
      department: event.department,
      location: event.location,
      startDate: event.startDate,
      status: event.status
    }));

    res.status(200).json(tableData);

  } catch (error) {
    console.error("Events Table Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- 3. UPDATE EVENT STATUS (Dropdown Action) ---
exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate Status Enum based on your Schema
    const validStatuses = ['Draft', 'Pending', 'Approved', 'Rejected', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid Status' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id, 
      { status: status },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, message: 'Status Updated', event: updatedEvent });

  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};