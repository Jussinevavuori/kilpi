export type TestingSubject = { userId: string } | null;

export const TestingUtils = {
  /**
   * Utility for creating a value which holds the current subject.
   *
   * @usage
   * ```
   * const subjectState = TestingUtils.createSubjectState();
   * const Kilpi = createKilpi({
   *  getSubject: subjectState.getSubject,
   * });
   *
   * // Sign in as user
   * subjectState.setSubject({ userId: 'user-123' });
   */
  createSubjectState(initialSubject: TestingSubject = null) {
    let subject: TestingSubject = initialSubject;
    return {
      getSubject() {
        return subject;
      },
      setSubject(newSubject: TestingSubject) {
        subject = newSubject;
      },
    };
  },
};
