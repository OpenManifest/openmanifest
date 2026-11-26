// Dev and CI builds only (constants/gallery.ts): every component of `app/ui` in every state, for the `@gallery` specs and
// for looking at. `?scheme=light|dark`, `?density=compact|regular|comfortable`, `?section=<id>` for one component;
// `?industry=generic` works as everywhere (it changes the words from the terms).
import * as React from 'react';
import { ScrollView } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, Text, ThemeProvider, useTheme, type Density, type Scheme } from 'app/ui';
import { SECTIONS } from './sections';

function Gallery({ section }: { section?: string }) {
  const { colour } = useTheme();
  const shown = section ? SECTIONS.filter(({ id }) => id === section) : SECTIONS;

  return (
    <ScrollView
      style={{ backgroundColor: colour.app }}
      contentContainerStyle={{ padding: 16 }}
      testID="gallery"
      // A page that scrolls and has nothing to focus (the text section) is still reachable by keyboard
      tabIndex={0}
    >
      <Stack gap="xl">
        <Text variant="title" role="heading" aria-level={1}>
          Gallery
        </Text>
        {shown.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </Stack>
      <PortalHost />
    </ScrollView>
  );
}

export default function GalleryScreen() {
  const parent = useTheme();
  const params =
    typeof window === 'undefined'
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search);
  const scheme = (
    ['light', 'dark'].includes(params.get('scheme') ?? '') ? params.get('scheme') : parent.scheme
  ) as Scheme;
  const density = (
    ['compact', 'regular', 'comfortable'].includes(params.get('density') ?? '')
      ? params.get('density')
      : null
  ) as Density | null;

  return (
    <ThemeProvider scheme={scheme} density={density}>
      <Gallery section={params.get('section') ?? undefined} />
    </ThemeProvider>
  );
}
