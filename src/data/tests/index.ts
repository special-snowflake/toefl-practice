
import { test01 } from "./test-01";
import { test02 } from "./test-02";
import { test03 } from "./test-03";
import { test04 } from "./test-04";
import { test05 } from "./test-05";
import { test06 } from "./test-06";
import { test07 } from "./test-07";
import { test08 } from "./test-08";
import { test09 } from "./test-09";
import { test10 } from "./test-10";
import type { TestData } from "@/types/test";

export const allTests: Record<string, TestData> = {
  "test-01": test01,
  "test-02": test02,
  "test-03": test03,
  "test-04": test04,
  "test-05": test05,
  "test-06": test06,
  "test-07": test07,
  "test-08": test08,
  "test-09": test09,
  "test-10": test10,
};

export function getTestById(id: string): TestData | undefined {
  return allTests[id];
}
export const testIds = Object.keys(allTests);
