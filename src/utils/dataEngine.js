import Papa from 'papaparse';

/**
 * Data Engine for Employee Performance Appraisal System
 * Handling CSV I/O and Data Transformation
 */

export const DataEngine = {
  // 1. Parse CSV File
  parseCSV: (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  },

  // 2. Export Data to CSV
  exportCSV: (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  // 3. Process Evaluators Mapping (Who evaluates whom)
  // Input: Employee List with 'Dept', 'Role'
  // Output: Map of { targetId: { peer: [], manager: [], staff: [] } }
  autoMapEvaluators: (employees) => {
    const mapping = {};
    
    employees.forEach(target => {
      mapping[target.id] = {
        peers: [],
        manager: [],
        staff: []
      };

      employees.forEach(rater => {
        if (target.id === rater.id) return; // Skip self

        // Peer: Same Dept, Same Level (simplified logic)
        if (target.department === rater.department && target.position === rater.position) {
          mapping[target.id].peers.push(rater.id);
        }
        
        // Manager: Same Dept, Higher Position (simplified)
        // In real app, would need strict hierarchy definitions
      });
    });
    return mapping;
  }
};
