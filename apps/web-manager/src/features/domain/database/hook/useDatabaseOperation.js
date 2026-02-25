import { useDispatch, useSelector } from 'react-redux';
import { startDatabaseAPI, stopDatabaseAPI } from '@/features/domain/database/databaseAPI.js';
import { setDatabases } from '@/features/domain/database/databaseSlice.js';
import { getDatabaseFormat } from '@/lib/treeFormat.js';

const useDatabaseOperation = () => {
  const { activeHost } = useSelector((state) => state.host);
  const { databases } = useSelector((state) => state.database);
  const dispatch = useDispatch();

  const refreshDatabase = (database, response) => {
    if (response.success) {
      const newDatabases = databases.map((db) => {
        if (db.key === database.key) {
          const dbResult = response.result.find((res) => res.dbname === database.dbname);
          return {
            ...getDatabaseFormat(dbResult),
            key: database.key,
          };
        }
        return db;
      });
      dispatch(setDatabases(newDatabases));
    }
  };

  const stopDatabase = async (database) => {
    const response = await stopDatabaseAPI(activeHost, database);
    refreshDatabase(database, response);
  };
  const startDatabase = async (database) => {
    const response = await startDatabaseAPI(activeHost, database);
    refreshDatabase(database, response);
  };

  return {
    startDatabase,
    stopDatabase,
  };
};

export default useDatabaseOperation;
