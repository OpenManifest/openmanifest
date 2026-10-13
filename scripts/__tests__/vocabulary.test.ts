/* eslint-disable @typescript-eslint/no-require-imports */
// P7.1: the rename map and the functions behind `yarn check:vocabulary` and `yarn rename:vocabulary`. The backend has the
// same cases in spec/lib/vocabulary_spec.rb for lib/vocabulary.rb.
const vocabulary = require('../lib/vocabulary');

const all = vocabulary.entries();
const rewrite = (text: string, groups?: string[]) =>
  vocabulary.rewrite(text, groups ? vocabulary.entries(groups) : all);

describe('vocabulary.rewrite', () => {
  const cases: [string, string][] = [
    ['dropzone', 'operator'],
    ['Dropzone', 'Operator'],
    ['dropzones', 'operators'],
    ['dropzoneId', 'operatorId'],
    ['dropzone_id', 'operator_id'],
    ['currentDropzoneId', 'currentOperatorId'],
    ['DropzoneUser', 'Membership'],
    ['dropzoneUsers', 'memberships'],
    ['dropzone_users', 'memberships'],
    ['DROPZONE_USER', 'MEMBERSHIP'],
    ['updateDropzoneUser', 'updateMembership'],
    ['DropzoneUserEssentials', 'MembershipEssentials'],
    ['exit_weight', 'body_mass_kg'],
    ['exitWeight', 'bodyMassKg'],
    ['ExitWeight', 'BodyMassKg'],
    ['EXIT_WEIGHT', 'BODY_MASS_KG'],
    ['planes', 'vehicles'],
    ['rigs', 'equipment'],
    ['Rigs', 'Equipment'],
    ['federations', 'certificationBodies'],
    ['Federations', 'CertificationBodies'],
    ['federationId', 'certificationBodyId'],
    ['createPlane', 'createVehicle'],
    ['PlaneChip', 'VehicleChip'],
    ['actAsDZSO', 'actAsDutyOfficer'],
    ['dropzone-user-card', 'membership-card'],
    ['my-dropzone', 'my-operator'],
  ];

  it.each(cases)('turns %s into %s', (input, expected) => {
    expect(rewrite(input)).toBe(expected);
  });

  it('leaves words that merely contain an old word alone', () => {
    expect(rewrite('airplane bigrig planet riggers dropzoned')).toBe(
      'airplane bigrig planet riggers dropzoned'
    );
  });

  it('rewrites identifiers inside code and keeps everything else', () => {
    const source = "  const dropzone = useDropzone(); // the dropzone_user's DropzoneUser\n";
    expect(rewrite(source, ['tenant'])).toBe(
      "  const operator = useOperator(); // the membership's Membership\n"
    );
  });

  it('joins a one-word identifier that becomes several words as camelCase', () => {
    expect(rewrite('federation Federation', ['certifications'])).toBe(
      'certificationBody CertificationBody'
    );
    expect(vocabulary.rewrite('federation', vocabulary.entries(['certifications']), '_')).toBe(
      'certification_body'
    );
  });

  it('applies only the requested group', () => {
    expect(rewrite('dropzone plane', ['tenant'])).toBe('operator plane');
    expect(rewrite('dropzone plane', ['vehicle'])).toBe('dropzone vehicle');
  });

  it('prefers the longer phrase', () => {
    expect(
      rewrite('user_federation_qualification user_federation federation', ['certifications'])
    ).toBe('user_qualification user_certification certificationBody');
  });

  it('is idempotent: new names contain no old term', () => {
    for (const entry of all) {
      const renamed = rewrite(entry.old);
      expect(rewrite(renamed)).toBe(renamed);
    }
  });
});

describe('vocabulary.rewriteKeepingProse', () => {
  const keep = (text: string) =>
    vocabulary.rewriteKeepingProse(text, vocabulary.entries(['tenant']), '', 'screen.tsx');

  it('renames identifiers, types and typenames', () => {
    expect(keep("const dropzone: DropzoneUser = { __typename: 'DropzoneUser' };")).toBe(
      "const operator: Membership = { __typename: 'Membership' };"
    );
  });

  it('keeps JSX text, multi-word strings and copy props', () => {
    const source = `<Card label="Dropzone" title='Your dropzone'><Text>Select a dropzone</Text>{dropzone.name}</Card>`;
    expect(keep(source)).toBe(
      `<Card label="Dropzone" title='Your dropzone'><Text>Select a dropzone</Text>{operator.name}</Card>`
    );
  });

  it('keeps the text of template literals but renames their expressions', () => {
    expect(keep('notify.success(`Archived dropzone ${dropzone.name} for ${user}`)')).toBe(
      'notify.success(`Archived dropzone ${operator.name} for ${user}`)'
    );
    expect(keep('const key = `dropzone-${dropzone.id}`;')).toBe(
      'const key = `operator-${operator.id}`;'
    );
  });

  it('keeps the text a test looks for', () => {
    expect(keep("expect(screen.getByText('Dropzone')).toBeTruthy(); dropzone.id;")).toBe(
      "expect(screen.getByText('Dropzone')).toBeTruthy(); operator.id;"
    );
  });

  it('renames everything in files that are not source code', () => {
    expect(
      vocabulary.rewriteKeepingProse(
        'Select a dropzone',
        vocabulary.entries(['tenant']),
        '',
        'a.md'
      )
    ).toBe('Select a operator');
  });
});

describe('vocabulary.scan', () => {
  it('counts old terms per entry across identifiers', () => {
    const counts = vocabulary.scan(
      'Dropzone dropzoneId dropzone_users airplane DropzoneUser plane',
      all
    );
    expect(counts).toMatchObject({ dropzone: 2, dropzone_user: 2, plane: 1 });
  });
});

describe('vocabulary.isAllowed', () => {
  const allow = ['docs/**', 'app/**/skydiving/**', 'db/migrate/**', 'CHANGELOG.md'];

  it('matches the allow globs', () => {
    expect(vocabulary.isAllowed('docs/reference/README.md', allow)).toBe(true);
    expect(vocabulary.isAllowed('app/skydiving/jump.ts', allow)).toBe(true);
    expect(vocabulary.isAllowed('app/models/skydiving/jump.ts', allow)).toBe(true);
    expect(vocabulary.isAllowed('CHANGELOG.md', allow)).toBe(true);
  });

  it('does not match other paths', () => {
    expect(vocabulary.isAllowed('app/models/dropzone.ts', allow)).toBe(false);
    expect(vocabulary.isAllowed('lib/CHANGELOG.md', allow)).toBe(false);
  });
});

describe('config/vocabulary.yml', () => {
  it('has no entry for Load, which keeps its name (D5)', () => {
    expect(all.map((entry: { old: string }) => entry.old)).not.toContain('load');
    expect(all.map((entry: { old: string }) => entry.old)).not.toContain('load_number');
  });

  it('allows the skydiving paths, migrations and docs', () => {
    expect(vocabulary.loadConfig().allow).toEqual(
      expect.arrayContaining([
        'config/industries/skydiving/**',
        'db/migrate/**',
        'docs/**',
        'CHANGELOG.md',
      ])
    );
  });
});
