import * as React from 'react';
import { Button, Card } from 'react-native-paper';

import { useRigInspectionTemplateQuery } from 'app/api/reflection';

import {
  RigInspectionTemplateForm,
  useRigInspectionTemplateForm,
} from 'app/forms/rig_inspection_template';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useWindowDimensions, View } from 'react-native';

export default function RigInspectionTemplateScreen() {
  const { dropzone: currentDropzone } = useDropzoneContext();
  const { data } = useRigInspectionTemplateQuery({
    variables: {
      dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
    },
  });

  const canEdit = useRestriction(Permission.UpdateFormTemplate);
  const { control, loading, onSubmit } = useRigInspectionTemplateForm({
    template: data?.dropzone?.rigInspectionTemplate,
    dropzoneId: data?.dropzone?.id,
  });

  const { width } = useWindowDimensions();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ScrollableScreen style={{ marginTop: 16, width: width > 550 ? 550 : '100%' }}>
        <Card style={{ width: '100%' }}>
          <Card.Title title="Rig Inspection Form Template" />

          <Card.Content>
            <RigInspectionTemplateForm {...{ control }} />
          </Card.Content>
        </Card>
        <Button
          disabled={!canEdit}
          mode="contained"
          loading={loading}
          onPress={onSubmit}
          style={{ width: '100%', marginTop: 16, borderRadius: 20 }}
        >
          Save template
        </Button>
      </ScrollableScreen>
    </View>
  );
}
