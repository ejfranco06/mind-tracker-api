import { pool } from '../db/db';
const TABLE = 'meditation';
const AS_CAMEL_CASE = `id, posting_date AS "postingDate", username, awareness_points AS "awarenessPoints"`;
const DEFAULT_LIMIT = 100;

interface Meditation {
  id : string;
  postingDate: string;
  username: string;
  awarenessPoints: number
}

export const add = async (username: string, postingDate: moment.Moment) => {
  const SQL: string = `
    INSERT INTO ${TABLE} as m (posting_date, username)
	    VALUES ($1, $2) 
	  ON CONFLICT ON CONSTRAINT unique_entry 
		  DO UPDATE SET awareness_points = m.awareness_points + 1 
      where m.posting_date = EXCLUDED.posting_date AND m.username = EXCLUDED.username
    RETURNING ${AS_CAMEL_CASE};
  `;

  const PARAMS: [moment.Moment, string] = [postingDate, username];
  return (await pool.query(SQL, PARAMS)).rows[0] as Meditation;
};

export const getByUsername = async (username: string) => {
  const SQL: string = `
  SELECT ${AS_CAMEL_CASE} FROM ${TABLE} 
    WHERE username = $1
    ORDER BY posting_date DESC
    LIMIT ${DEFAULT_LIMIT};
  `;

  const PARAMS: [string] = [username];
  return (await pool.query(SQL, PARAMS)).rows as Meditation[];
};

export const deleteById = async (id: number) => {
  const SQL: string = `
  DELETE FROM ${TABLE} 
    WHERE id = $1
    RETURNING ${AS_CAMEL_CASE};
  `;

  const PARAMS: [number] = [id];
  return (await pool.query(SQL, PARAMS)).rows[0] as Meditation;
};

export const updateById = async (id: number, postingDate: moment.Moment, awarenessPoints: number ) => {
  const SQL: string = `
  UPDATE ${TABLE}
    SET posting_date = $2, awareness_points = $3
    WHERE id = $1
    RETURNING ${AS_CAMEL_CASE};
  `;
  const PARAMS: [number, moment.Moment, number ] = [id, postingDate, awarenessPoints];
  return (await pool.query(SQL, PARAMS)).rows[0] as Meditation;
};


export const meditationRepository = {
  add,
  getByUsername,
  deleteById,
  updateById
};
