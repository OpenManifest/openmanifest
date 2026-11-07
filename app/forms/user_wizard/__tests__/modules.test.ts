import { wizardLayout } from '../modules';

describe('wizardLayout', () => {
  it('asks a skydiver for everything: certifications, qualifications, date of birth and the parachute', () => {
    expect(
      wizardLayout({
        certifications: true,
        qualifications: true,
        dateOfBirth: true,
        parachute: true,
      })
    ).toEqual({
      certification: [3, 4, 5],
      qualifications: 6,
      dateOfBirth: 7,
      askForParachute: 8,
      parachuteFrom: 9,
    });
  });

  it('asks the member of a generic operator only for their name, nickname and photo', () => {
    expect(
      wizardLayout({
        certifications: false,
        qualifications: false,
        dateOfBirth: false,
        parachute: false,
      })
    ).toEqual({
      certification: null,
      qualifications: null,
      dateOfBirth: null,
      askForParachute: null,
      parachuteFrom: null,
    });
  });

  it('moves the date of birth up when there are no certifications', () => {
    expect(
      wizardLayout({
        certifications: false,
        qualifications: false,
        dateOfBirth: true,
        parachute: false,
      }).dateOfBirth
    ).toBe(3);
  });

  it('keeps the parachute questions after the certifications without qualifications or date of birth', () => {
    const layout = wizardLayout({
      certifications: true,
      qualifications: false,
      dateOfBirth: false,
      parachute: true,
    });
    expect(layout.askForParachute).toBe(6);
    expect(layout.parachuteFrom).toBe(7);
  });
});
