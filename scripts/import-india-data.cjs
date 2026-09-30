const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../fixtures/demo-data.json');
const data = require(dataPath);

// 1. Rename existing synthetic ones to real places so relations don't break
const renames = {
  "IN-BR-PAT-L01": { name: "Kumhrar", district: "Patna", state: "Bihar", sc: "BR" },
  "IN-BR-PAT-L02": { name: "Kankarbagh", district: "Patna", state: "Bihar", sc: "BR" },
  "IN-MH-PUN-L01": { name: "Kothrud", district: "Pune", state: "Maharashtra", sc: "MH" },
  "IN-MH-PUN-L02": { name: "Viman Nagar", district: "Pune", state: "Maharashtra", sc: "MH" },
  "IN-TN-MAD-L01": { name: "Anna Nagar", district: "Madurai", state: "Tamil Nadu", sc: "TN" },
  "IN-TN-MAD-L02": { name: "KK Nagar", district: "Madurai", state: "Tamil Nadu", sc: "TN" },
};

data.localities.forEach(loc => {
  if (renames[loc.id]) {
    const r = renames[loc.id];
    loc.name = r.name;
    loc.district_name = r.district;
    loc.state_name = r.state;
    loc.state_code = r.sc;
    loc.synthetic = false;
  }
});

// 2. Generate a massive list of real states, districts, and localities
const realData = {
  "MH": {
    name: "Maharashtra",
    districts: {
      "Mumbai": ["Andheri", "Bandra", "Dadar", "Borivali", "Colaba", "Malad", "Goregaon", "Juhu", "Powai", "Worli"],
      "Pune": ["Hinjewadi", "Baner", "Wakad", "Hadapsar", "Kalyani Nagar", "Shivajinagar", "Kharadi"],
      "Nagpur": ["Sitabuldi", "Dharampeth", "Mahal", "Wardhaman Nagar", "Sadar"],
      "Thane": ["Naupada", "Wagle Estate", "Kopri", "Majiwada"],
      "Nashik": ["Panchavati", "Indira Nagar", "CIDCO", "Satpur"]
    }
  },
  "DL": {
    name: "Delhi",
    districts: {
      "New Delhi": ["Connaught Place", "Chanakyapuri", "Parliament Street", "Gole Market"],
      "South Delhi": ["Hauz Khas", "Saket", "Greater Kailash", "Vasant Kunj", "Defence Colony", "Lajpat Nagar"],
      "North Delhi": ["Civil Lines", "Sadar Bazaar", "Kotwali", "Model Town"],
      "East Delhi": ["Preet Vihar", "Mayur Vihar", "Patparganj", "Laxmi Nagar"],
      "West Delhi": ["Rajouri Garden", "Punjabi Bagh", "Patel Nagar", "Janakpuri"]
    }
  },
  "KA": {
    name: "Karnataka",
    districts: {
      "Bengaluru Urban": ["Koramangala", "Indiranagar", "Jayanagar", "Whitefield", "Malleswaram", "HSR Layout", "BTM Layout", "Electronic City", "Marathahalli", "Yelahanka"],
      "Mysuru": ["Gokulam", "Saraswathipuram", "Kuvempunagar", "Vijayanagar"],
      "Mangaluru": ["Kadri", "Bejai", "Kankanady", "Surathkal"],
      "Hubballi-Dharwad": ["Vidya Nagar", "Navanagar", "Gokul Road"]
    }
  },
  "UP": {
    name: "Uttar Pradesh",
    districts: {
      "Lucknow": ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Aminabad"],
      "Kanpur": ["Swaroop Nagar", "Kakadeo", "Kidwai Nagar", "Civil Lines"],
      "Gautam Buddha Nagar": ["Sector 15 Noida", "Sector 18 Noida", "Sector 62 Noida", "Greater Noida West"],
      "Varanasi": ["Lanka", "Bhelupur", "Sigra", "Cantt"],
      "Agra": ["Tajganj", "Sanjay Place", "DayalBagh", "Kamla Nagar"]
    }
  },
  "TN": {
    name: "Tamil Nadu",
    districts: {
      "Chennai": ["T. Nagar", "Mylapore", "Adyar", "Velachery", "Tambaram", "Anna Nagar", "Besant Nagar", "Guindy", "Nungambakkam"],
      "Coimbatore": ["R.S. Puram", "Peelamedu", "Gandhipuram", "Saibaba Colony"],
      "Madurai": ["Tirunagar", "Tallakulam", "Avani Moola Street"],
      "Tiruchirappalli": ["Srirangam", "Thillai Nagar", "Cantonment"]
    }
  },
  "TG": {
    name: "Telangana",
    districts: {
      "Hyderabad": ["Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli", "Madhapur", "Kukatpally", "Secunderabad", "Ameerpet", "Mehdipatnam", "Charminar"],
      "Warangal": ["Hanamkonda", "Kazipet", "Subedari"]
    }
  },
  "WB": {
    name: "West Bengal",
    districts: {
      "Kolkata": ["Salt Lake", "Park Street", "New Town", "Ballygunge", "Alipore", "Dum Dum", "Jadavpur", "Gariahat"],
      "Howrah": ["Shibpur", "Bally", "Salkia"],
      "Darjeeling": ["Siliguri", "Kurseong", "Kalimpong"] // Kalimpong is a district now but for demo
    }
  },
  "GJ": {
    name: "Gujarat",
    districts: {
      "Ahmedabad": ["Navrangpura", "Vastrapur", "Satellite", "Bopal", "Maninagar", "Paldi", "Thaltej"],
      "Surat": ["Adajan", "Vesu", "Piplod", "Varachha", "Athwa"],
      "Vadodara": ["Alkapuri", "Akota", "Fatehgunj", "Karelibaug"],
      "Rajkot": ["Kalawad Road", "Amin Marg", "Race Course"]
    }
  },
  "RJ": {
    name: "Rajasthan",
    districts: {
      "Jaipur": ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Raja Park"],
      "Jodhpur": ["Sardarpura", "Shastri Nagar", "Chopasni Housing Board"],
      "Udaipur": ["Fatehpura", "Sector 4", "Hiran Magri", "Panchwati"]
    }
  },
  "KL": {
    name: "Kerala",
    districts: {
      "Thiruvananthapuram": ["Kowdiar", "Sasthamangalam", "Pattom", "Vazhuthacaud"],
      "Ernakulam": ["Kakkanad", "Edappally", "Palarivattom", "Vyttila", "Kaloor", "Fort Kochi", "Panampilly Nagar"],
      "Kozhikode": ["Nadakkavu", "Vellayil", "Mankavu"]
    }
  },
  "MP": {
    name: "Madhya Pradesh",
    districts: {
      "Indore": ["Vijay Nagar", "Palasia", "Bhawarkua", "Rajwada"],
      "Bhopal": ["Arera Colony", "MP Nagar", "Kolar Road", "Bairagarh"]
    }
  },
  "PB": {
    name: "Punjab",
    districts: {
      "Ludhiana": ["Sarabha Nagar", "Model Town", "Civil Lines"],
      "Amritsar": ["Ranjit Avenue", "Civil Lines", "Putligarh"],
      "Chandigarh": ["Sector 17", "Sector 22", "Sector 35", "Mani Majra"]
    }
  },
  "HR": {
    name: "Haryana",
    districts: {
      "Gurugram": ["DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "Cyber City", "Sector 29", "Sushant Lok"],
      "Faridabad": ["Sector 15", "Sector 21", "NIT"]
    }
  }
};

const newLocalities = [];

for (const [stateCode, stateData] of Object.entries(realData)) {
  for (const [district, localities] of Object.entries(stateData.districts)) {
    const districtId = `IN-${stateCode}-${district.substring(0,3).toUpperCase()}`;
    localities.forEach((locName, idx) => {
      newLocalities.push({
        id: `${districtId}-L${String(idx+1).padStart(3, '0')}`,
        district_id: districtId,
        district_name: district,
        state_code: stateCode,
        state_name: stateData.name,
        name: locName,
        synthetic: false
      });
    });
  }
}

// Ensure no ID collisions with existing
const existingIds = new Set(data.localities.map(l => l.id));
const toAdd = newLocalities.filter(l => !existingIds.has(l.id));

data.localities = [...data.localities, ...toAdd];

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Added ${toAdd.length} real Indian localities!`);
