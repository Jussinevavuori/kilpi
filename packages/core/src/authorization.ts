/**
 * An authorization object that represents a granted authorization with the narrowed down subject.
 */
export type Authorization<TSubject> = {
  subject: TSubject;
};

/**
 * Utility function to construct an authorization object.
 */
export function authorization<TSubject>(subject: TSubject): Authorization<TSubject> {
  return { subject };
}
