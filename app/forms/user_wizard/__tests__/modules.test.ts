import { wizardLayout } from '../modules';

describe('wizardLayout', () => {
  it('asks a skydiver for everything: certifications, qualifications, date of birth and the rig', () => {
    expect(
      wizardLayout({ certifications: true, qualifications: true, dateOfBirth: true, rigs: true })
    ).toEqual({
      certification: [3, 4, 5],
      qualifications: 6,
      dateOfBirth: 7,
      askForRig: 8,
      rigFrom: 9,
    });
  });

  it('asks the member of a generic operator only for their name, nickname and photo', () => {
    expect(
      wizardLayout({
        certifications: false,
        qualifications: false,
        dateOfBirth: false,
        rigs: false,
      })
    ).toEqual({
      certification: null,
      qualifications: null,
      dateOfBirth: null,
      askForRig: null,
      rigFrom: null,
    });
  });

  it('moves the date of birth up when there are no certifications', () => {
    expect(
      wizardLayout({ certifications: false, qualifications: false, dateOfBirth: true, rigs: false })
        .dateOfBirth
    ).toBe(3);
  });

  it('keeps the rig questions after the certifications without qualifications or date of birth', () => {
    const layout = wizardLayout({
      certifications: true,
      qualifications: false,
      dateOfBirth: false,
      rigs: true,
    });
    expect(layout.askForRig).toBe(6);
    expect(layout.rigFrom).toBe(7);
  });
});
