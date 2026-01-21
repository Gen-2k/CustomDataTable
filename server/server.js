const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const CONFIG = {
  PORT: 5000,
  DATA_PATH: path.join(__dirname, "data.json"),
};

/**
 * --- UTILITIES ---
 */
const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : null), obj);
};

const isDate = (val) => {
  if (!val || typeof val === "number") return false;
  const d = new Date(val);
  return d instanceof Date && !isNaN(d) && String(val).includes("-");
};

const setNestedValue = (obj, path, value) => {
  if (!obj || !path) return;
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => (acc[key] = acc[key] || {}), obj);
  target[lastKey] = value;
};

// Global cache for facets to handle 100k+ records efficiently
let GLOBAL_FACETS = {};

const precomputeFacets = (data) => {
  const fields = ["work.title", "work.department", "work.company", "work.contractType", "profile.nationality", "contact.address.city"];
  const facets = {};
  fields.forEach(field => {
    const values = data.map(item => getNestedValue(item, field)).filter(Boolean);
    facets[field] = [...new Set(values)].sort();
  });
  return facets;
};

/**
 * --- QUERY ENGINE ---
 */
class QueryEngine {
  /**
   * Applies advanced filters and global search
   */
  static process(data, { search, filters }) {
    let result = data;

    // 1. Column-specific filters
    if (filters && filters.length > 0) {
      result = result.filter((item) => {
        return filters.every(({ field, operator, value }) => {
          const fields = String(field).split(",");
          const rawValues = fields
            .map((f) => getNestedValue(item, f.trim()))
            .filter((v) => v != null);

          if (rawValues.length === 0) return false;

          const target = String(value).toLowerCase();

          // Helper for comparison logic (Number vs Date)
          const compare = (a, b, op) => {
            const valA = isDate(a) ? new Date(a).getTime() : Number(a);
            const valB = isDate(b) ? new Date(b).getTime() : Number(b);

            if (isNaN(valA) || isNaN(valB)) return false;

            if (op === "gt") return valA > valB;
            if (op === "lt") return valA < valB;
            return false;
          };

          const tokens = [];
          rawValues.forEach((rv) => {
            if (Array.isArray(rv)) {
              rv.forEach((v) => tokens.push(String(v).toLowerCase()));
            } else {
              tokens.push(String(rv).toLowerCase());
            }
          });

          const combinedText = tokens.join(" ");

          switch (operator) {
            case "between": {
              const [startStr, endStr] = String(value).split(",");
              const valA = isDate(rawValues[0])
                ? new Date(rawValues[0]).getTime()
                : Number(rawValues[0]);
              const valS = isDate(startStr)
                ? new Date(startStr).getTime()
                : Number(startStr);
              const valE = isDate(endStr)
                ? new Date(endStr).getTime()
                : Number(endStr);

              if (isNaN(valA) || isNaN(valS) || isNaN(valE)) return false;
              // Inclusive range check
              return valA >= valS && valA <= valE;
            }
            case "is":
              return tokens.some((t) => t === target);
            case "neq":
              return !tokens.some((t) => t === target);
            case "starts":
              return tokens.some((t) => t.startsWith(target));
            case "ends":
              return tokens.some((t) => t.endsWith(target));
            case "gt":
              return compare(rawValues[0], value, "gt");
            case "lt":
              return compare(rawValues[0], value, "lt");
            case "contains":
            default:
              return combinedText.includes(target);
          }
        });
      });
    }

    // 2. Global search: Tokenized Multi-word logic
    if (search && search.trim()) {
      const searchTokens = search.toLowerCase().trim().split(/\s+/);

      result = result.filter((item) => {
        const pieces = [
          item.profile?.firstName,
          item.profile?.lastName,
          item.username,
          item.contact?.primaryEmail,
          item.work?.company,
          item.work?.title,
          item.work?.department,
          item.contact?.address?.city,
          item.profile?.nationality,
          item.work?.contractType,
          String(item.finance?.salary || ""),
          String(item.finance?.creditScore || ""),
        ];

        if (item.work?.skills && Array.isArray(item.work.skills)) {
          pieces.push(...item.work.skills);
        }

        const searchableText = pieces
          .filter((p) => p != null)
          .map((p) => String(p).toLowerCase())
          .join(" ");

        return searchTokens.every((token) => searchableText.includes(token));
      });
    }

    return result;
  }

  static sort(data, key, order) {
    if (!key) return data;
    const isDesc = order === "desc";

    return [...data].sort((a, b) => {
      const vA = getNestedValue(a, key);
      const vB = getNestedValue(b, key);

      if (vA === vB) return 0;
      if (vA == null) return 1;
      if (vB == null) return -1;

      let comparison = 0;
      if (isDate(vA) && isDate(vB)) {
        comparison = new Date(vA).getTime() - new Date(vB).getTime();
      } else if (typeof vA === "number" && typeof vB === "number") {
        comparison = vA - vB;
      } else {
        comparison = String(vA).localeCompare(String(vB));
      }

      return isDesc ? comparison * -1 : comparison;
    });
  }

  static paginate(data, page, limit) {
    const start = (page - 1) * limit;
    
    return {
      data: data.slice(start, start + limit),
      meta: {
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      },
    };
  }
}

let db = [];
try {
  console.log("Loading database from disk...");
  const rawData = fs.readFileSync(CONFIG.DATA_PATH, "utf-8");
  db = JSON.parse(rawData);
  console.log(`Loaded ${db.length.toLocaleString()} records.`);
  console.log("Precomputing global facets...");
  GLOBAL_FACETS = precomputeFacets(db);
  console.log("Facets ready.");
} catch (err) {
  console.error("Database failure:", err.message);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/users", (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const { search, sortBy, sortOrder } = req.query;
    const filters = req.query.filters ? JSON.parse(req.query.filters) : [];

    let results = QueryEngine.process(db, { search, filters });
    results = QueryEngine.sort(results, sortBy, sortOrder);

    const outcome = QueryEngine.paginate(results, page, limit);

    setTimeout(() => res.json(outcome), 150);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Server error processing request" });
  }
});

// Dedicated Metadata (Facet) Endpoint
app.get("/api/facets/:field", (req, res) => {
  try {
    const { field } = req.params;
    if (GLOBAL_FACETS[field]) {
      return res.json(GLOBAL_FACETS[field]);
    }
    // Fallback if not precomputed
    const rawValues = db.map(item => getNestedValue(item, field)).filter(Boolean);
    let flattened = [];
    rawValues.forEach(rv => {
      if (Array.isArray(rv)) {
        flattened.push(...rv);
      } else {
        flattened.push(rv);
      }
    });
    const unique = [...new Set(flattened)].sort();
    res.json(unique);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch facets" });
  }
});

app.put("/api/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const recordIndex = db.findIndex((u) => String(u.id) === String(id) || String(u._id) === String(id));

    if (recordIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Apply updates
    const record = db[recordIndex];
    Object.keys(updates).forEach((key) => {
      // Check if it's a nested update (contains dot) or simple
      if (key.includes(".")) {
        setNestedValue(record, key, updates[key]);
      } else {
        record[key] = updates[key];
      }
    });

    // Persistence: Save changes to disk
    fs.writeFileSync(CONFIG.DATA_PATH, JSON.stringify(db, null, 2));

    // Update global facet cache for the updated field
    Object.keys(updates).forEach(key => {
      // Re-extract facets for this specific field to keep memory state fresh
      const values = db.map(item => getNestedValue(item, key)).filter(Boolean);
      let flattened = [];
      values.forEach(rv => {
        if (Array.isArray(rv)) flattened.push(...rv);
        else flattened.push(rv);
      });
      GLOBAL_FACETS[key] = [...new Set(flattened)].sort();
    });

    setTimeout(() => res.json(record), 150);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update record" });
  }
});

app.listen(CONFIG.PORT, () => {
  console.log(`Server ready at http://localhost:${CONFIG.PORT}`);
});
