import { getDocumentsByView } from '../util/couch-service.js';

class WhereManager {

  async where(view, propName, options = {}) {
    const key = options.key;
    const propValue = options.propValue;
    const database = options.database;

    try {
      const viewResponse = await getDocumentsByView(database, view, key);
      
      if (!viewResponse.success) {
        throw new Error(viewResponse.message || 'Failed to fetch documents from view');
      }

      const docs = viewResponse.documents;
    
      if (docs.length === 0) {
        return {
          success: true,
          message: 'No documents found for the specified view',
          documents: []
        };
      }

      // Filter documents by property
      const filteredDocs = docs.filter(doc => {
        return doc.hasOwnProperty(propName);
      });

      if (filteredDocs.length === 0) {
        return {
          success: true,
          message: `No documents found with property '${propName}'`,
          documents: []
        };
      }

      // If a specific property value is provided, filter by that value
      if (propValue !== undefined) {
        const matchingDocs = filteredDocs.filter(doc => {
          const docValue = doc[propName];
          // Handle different types of comparison
          if (typeof docValue === 'string' && typeof propValue === 'string') {
            return docValue.toLowerCase() === propValue.toLowerCase();
          }
          return docValue === propValue;
        });

        return {
          success: true,
          message: matchingDocs.length > 0 
            ? `Found ${matchingDocs.length} document(s) where '${propName}' equals '${propValue}'`
            : `No documents found where '${propName}' equals '${propValue}'`,
          documents: matchingDocs,
          propertyName: propName,
          propertyValue: propValue
        };
      }

      // If no specific value provided, group documents by property values
      const groupedByValue = filteredDocs.reduce((acc, doc) => {
        const value = doc[propName];
        const valueKey = value === null ? 'null' : value === undefined ? 'undefined' : String(value);
        
        if (!acc[valueKey]) {
          acc[valueKey] = {
            value: value,
            count: 0,
            documents: []
          };
        }
        
        acc[valueKey].count++;
        acc[valueKey].documents.push(doc);
        return acc;
      }, {});

      const groups = Object.values(groupedByValue);
      const totalDocs = filteredDocs.length;
      const uniqueValues = groups.length;

      return {
        success: true,
        message: `Found ${totalDocs} document(s) with property '${propName}' having ${uniqueValues} unique value(s)`,
        documents: filteredDocs,
        groups: groups,
        propertyName: propName,
        summary: {
          totalDocuments: totalDocs,
          uniqueValues: uniqueValues,
          valueDistribution: groups.map(group => ({
            value: group.value,
            count: group.count
          }))
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Error executing where command: ${error.message}`,
        error: error.message
      };
    }
  }
}

export default WhereManager;