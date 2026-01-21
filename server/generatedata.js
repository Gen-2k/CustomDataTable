const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * --- CONFIGURATION ---
 */
const TARGET_RECORDS = 100000;
const OUTPUT_FILE = path.join(__dirname, "data.json");

/**
 * --- DATA POOLS ---
 */
const POOLS = {
  firstNames: [
    "James",
    "Mary",
    "Robert",
    "Patricia",
    "John",
    "Jennifer",
    "Michael",
    "Linda",
    "David",
    "Elizabeth",
    "Surya",
    "Priya",
    "Rahul",
    "Wei",
    "Li",
    "Hiroshi",
    "Yuki",
  ],
  lastNames: [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Rodriguez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Lee",
    "Thompson",
  ],
  domains: [
    "gmail.com",
    "yahoo.com",
    "expenzo.corp",
    "techflow.io",
    "protonmail.com",
    "zeesoft.com",
  ],
  titles: [
    "Senior Software Engineer",
    "Product Owner",
    "HR Manager",
    "Sales Lead",
    "Marketing Lead",
    "Data Analyst",
    "CTO",
    "DevOps Engineer",
    "UI/UX Designer",
    "Project Manager",
    "Team Lead",
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "ML Engineer",
    "AI Engineer",
    "Testing Engineer",
    "Automation Engineer",
    "Security Engineer",
    "Junior Software Engineer",
    "Technical Lead",
    "Technical Architect",
    
  ],
  departments: [
    "Engineering",
    "Sales",
    "Marketing",
    "Human Resources",
    "Finance",
    "Legal",
    "Operations",
    "IT",
    "Customer Support",
  ],
  companies: [
    "Globex Corp",
    "Soylent Corp",
    "Initech",
    "Umbrella Corp",
    "Stark Industries",
    "Wayne Enterprises",
    "Cyberdyne Systems",
    "TechFlow",
    "Expenzo",
    "Zeesoft",
    "ProtonMail",
    "Google",
    "Microsoft",
    "Apple",
    "Amazon",
    "Facebook",
    "Twitter",
    "Instagram",
    "Snapchat",
    "TikTok",
    "WhatsApp",
    "Telegram",
    "LinkedIn",
    "YouTube",
    "Netflix",
    "Spotify",
    "Twitch",
    "TikTok",
  ],
  banks: [
    "Chase",
    "Bank of America",
    "HDFC",
    "ICICI",
    "Wells Fargo",
    "Citibank",
  ],
  currencies: ["USD", "EUR", "INR", "GBP", "JPY"],
  expenseMerchants: [
    "Uber",
    "Amazon",
    "Starbucks",
    "Delta Airlines",
    "Apple Store",
    "WeWork",
  ],
};

/**
 * --- HELPERS ---
 */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const maybe = (value, chance = 0.2) => (Math.random() > chance ? value : null);
const datePast = () =>
  new Date(Date.now() - randInt(0, 100000000000)).toISOString();

const generateExpenses = (count) => {
  return Array.from({ length: count }, () => ({
    id: crypto.randomUUID().split("-")[0],
    merchant: pick(POOLS.expenseMerchants),
    amount: parseFloat((Math.random() * 2000 + 10).toFixed(2)),
    currency: pick(POOLS.currencies),
    date: datePast(),
    status: pick(["approved", "pending", "rejected"]),
    receiptAttached: Math.random() > 0.5,
  }));
};

/**
 * --- MAIN GENERATION ENGINE ---
 */
async function generateData() {
  console.log(`Generating ${TARGET_RECORDS.toLocaleString()} records...`);

  const writeStream = fs.createWriteStream(OUTPUT_FILE);
  writeStream.write("[\n");

  for (let i = 0; i < TARGET_RECORDS; i++) {
    const fn = pick(POOLS.firstNames);
    const ln = pick(POOLS.lastNames);
    const isEmployee = Math.random() > 0.1;

    const user = {
      id: crypto.randomUUID(),
      username: `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1, 99)}`,
      avatar: `https://i.pravatar.cc/150?u=${i}`,
      profile: {
        firstName: fn,
        middleName: maybe(pick(POOLS.firstNames), 0.7),
        lastName: ln,
        gender: pick(["Male", "Female", "Non-binary", "Other"]),
        dob: new Date(1975 + randInt(0, 25), randInt(0, 11), randInt(1, 28))
          .toISOString()
          .split("T")[0],
        nationality: pick(["US", "IN", "UK", "CA", "DE", "FR"]),
        languages: [
          pick(["English"]),
          maybe("Spanish", 0.5),
          maybe("French", 0.8),
        ].filter(Boolean),
      },
      contact: {
        primaryEmail: `${fn}.${ln}@${pick(POOLS.domains)}`.toLowerCase(),
        phone: {
          mobile: `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(
            1000,
            9999
          )}`,
          work: maybe(`+1-800-${randInt(100, 999)}-${randInt(1000, 9999)}`),
        },
        address: {
          city: pick([
            "New York",
            "San Francisco",
            "London",
            "Berlin",
            "Tokyo",
            "Mumbai",
            "Chennai",
            "Delhi",
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Ahmedabad",
            "Australia",
            "Canada",
            "Germany",
            "UK",
            "France",
            "Japan",
            "China",
            "Singapore",
          ]),
          zipCode: `${randInt(10000, 99999)}`,
        },
      },
      work: {
        company: pick(POOLS.companies),
        department: pick(POOLS.departments),
        title: pick(POOLS.titles),
        dateJoined: datePast(),
        contractType: pick(["Full-Time", "Contract", "Part-Time"]),
        isRemote: Math.random() > 0.5,
        skills: Array.from({ length: randInt(2, 4) }, () =>
          pick(["React", "Node", "Excel", "Design", "SQL", "Python"])
        ),
      },
      finance: {
        salary: isEmployee ? randInt(60000, 180000) : 0,
        currency: pick(POOLS.currencies),
        creditScore: randInt(600, 850),
        bank: pick(POOLS.banks),
      },
      appData: {
        isActive: Math.random() > 0.05,
        lastLogin: datePast(),
        expenses: generateExpenses(randInt(0, 3)),
      },
    };

    const isLast = i === TARGET_RECORDS - 1;
    const chunk = JSON.stringify(user, null, 2) + (isLast ? "" : ",\n");

    if (!writeStream.write(chunk)) {
      await new Promise((resolve) => writeStream.once("drain", resolve));
    }

    if ((i + 1) % 20000 === 0)
      console.log(`Progress: ${i + 1} records written...`);
  }

  writeStream.write("\n]");
  writeStream.end();

  writeStream.on("finish", () =>
    console.log(`DONE. Data saved to ${OUTPUT_FILE}`)
  );
}

generateData().catch(console.error);
