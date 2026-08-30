
export const TEST_IDS = ["test-01","test-02","test-03","test-04","test-05","test-06","test-07","test-08","test-09","test-10"] as const;
export function pickRandomTestId(): string {
  return TEST_IDS[Math.floor(Math.random()*TEST_IDS.length)];
}
