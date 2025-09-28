export type SessionPayload = {
  /**
   * Session ID in the database
   */
  id: number;
  /**
   * Expiration date of the session in ISO 8601 format
   */
  expires: string;
};
