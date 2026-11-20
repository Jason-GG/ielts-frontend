import { SetPracticePage } from './SetPracticePage'

export function SetPracticeAPage() {
  return <SetPracticePage title="单科套题练习 · A类" breadcrumb="单科套题练习 A" category="practice-a" />
}

export function SetPracticeGPage() {
  return <SetPracticePage title="单科套题练习 · G类" breadcrumb="单科套题练习 G" category="practice-g" />
}

export function FullMockAPage() {
  return <SetPracticePage title="三科全真模考 · A类" breadcrumb="三科全真模考 A" category="full-mock-a" showWarning />
}

export function FullMockGPage() {
  return <SetPracticePage title="三科全真模考 · G类" breadcrumb="三科全真模考 G" category="full-mock-g" showWarning />
}

export function JijingSetAPage() {
  return <SetPracticePage title="三科机经真题 · A类" breadcrumb="三科机经真题 A" category="jijing-a" />
}
