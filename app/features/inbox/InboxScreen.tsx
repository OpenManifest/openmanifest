import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useApolloClient } from '@apollo/client';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Icon, ListRow, Skeleton, Text, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import {
  InboxDocument,
  UnseenNotificationsDocument,
  useInboxQuery,
  useMarkNotificationSeenMutation,
} from 'app/api/reflection';
import { useOperatorContext } from 'app/providers';
import { formatRelative } from 'app/i18n/format';
import { iconOf, notificationsOf, targetOf, titleKeyOf, type InboxNotification } from './inbox';
import { openTarget } from './openTarget';

const PAGE = 30;
/** How many of the newest "Mark all as read" reads at a time: one request each, a few at once */
const ALL = 200;
const AT_ONCE = 10;

/**
 * The member's notifications, newest first, the ones not read marked: a row opens what it is about (the load of a
 * call, the rig that needs inspecting) and marks itself read. "Mark all as read" does it for the lot.
 */
export default function InboxScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const navigation = useNavigation();
  const client = useApolloClient();
  const isFocused = useIsFocused();
  const {
    operator: { operator },
  } = useOperatorContext();
  const [size, setSize] = React.useState(PAGE);
  const [marking, setMarking] = React.useState(false);

  const { data, loading, refetch } = useInboxQuery({
    variables: { operatorId: operator?.id as string, first: size },
    skip: !operator?.id,
    fetchPolicy: 'cache-and-network',
  });
  React.useEffect(() => {
    if (isFocused && operator?.id) refetch();
  }, [isFocused, operator?.id, refetch]);
  const [markSeen] = useMarkNotificationSeenMutation();

  const notifications = React.useMemo(() => notificationsOf(data), [data]);
  // What the server counts, which can be more than the page shows
  const unread = data?.operator?.currentUser?.unseenNotifications ?? 0;
  const connection = data?.operator?.currentUser?.notifications;
  const waiting = !operator || (loading && !data);

  const read = (notification: InboxNotification, count = true) =>
    notification.isSeen
      ? Promise.resolve()
      : markSeen({
          variables: { id: Number(notification.id) },
          // The badge asks again after each, unless many are read and it asks once at the end
          refetchQueries: count ? [UnseenNotificationsDocument] : [],
          optimisticResponse: {
            updateNotification: {
              __typename: 'UpdateNotificationPayload',
              errors: null,
              notification: {
                __typename: 'Notification',
                id: notification.id,
                isSeen: true,
              },
            },
          },
        });

  const open = (notification: InboxNotification) => {
    read(notification);
    openTarget(
      navigation.navigate as never,
      targetOf(notification.notificationType, notification.resource)
    );
  };
  const readAll = async () => {
    setMarking(true);
    try {
      // The page shows the newest few: read the newest many, which are the ones that are not read
      const { data: all } = await client.query({
        query: InboxDocument,
        variables: { operatorId: operator?.id as string, first: ALL },
        fetchPolicy: 'network-only',
      });
      const waiting = notificationsOf(all).filter(({ isSeen }) => !isSeen);
      for (let at = 0; at < waiting.length; at += AT_ONCE) {
        await Promise.all(
          waiting.slice(at, at + AT_ONCE).map((notification) => read(notification, false))
        );
      }
      await Promise.all([
        refetch(),
        client.refetchQueries({ include: [UnseenNotificationsDocument] }),
      ]);
    } finally {
      setMarking(false);
    }
  };

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView
        testID="inbox"
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: theme.space.xxxl,
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        {waiting ? (
          <View style={{ gap: theme.space.md }} testID="inbox-loading">
            <Skeleton height={72} />
            <Skeleton height={72} />
            <Skeleton height={72} />
          </View>
        ) : !notifications.length ? (
          <EmptyState
            testID="inbox-empty"
            icon="bell-outline"
            title={t('inbox.empty.title')}
            body={t('inbox.empty.body')}
          />
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: theme.space.md,
              }}
            >
              <Text variant="title" role="heading" aria-level={2} testID="inbox-summary">
                {unread ? t('inbox.unread', { count: unread }) : t('inbox.allRead')}
              </Text>
              {unread ? (
                <Button
                  variant="tertiary"
                  testID="inbox-read-all"
                  label={t('inbox.readAll')}
                  loading={marking}
                  onPress={readAll}
                />
              ) : null}
            </View>
            <View
              testID="inbox-list"
              style={{
                backgroundColor: theme.colour.surface,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colour.border,
                paddingVertical: theme.space.sm,
              }}
            >
              {notifications.map((notification) => {
                const title = String(t(titleKeyOf(notification.notificationType)));
                const when = formatRelative(notification.createdAt, undefined, operator?.timeZone);
                return (
                  <ListRow
                    key={notification.id}
                    testID={`inbox-${notification.id}`}
                    title={title}
                    aria-label={`${notification.isSeen ? '' : `${t('inbox.new')}, `}${title}, ${
                      notification.message ?? ''
                    }, ${when}`}
                    supporting={[notification.message, when].filter(Boolean).join(' · ')}
                    leading={
                      <Icon name={iconOf(notification.notificationType) as never} size={24} />
                    }
                    trailing={
                      notification.isSeen ? undefined : (
                        <View
                          testID={`inbox-${notification.id}-unread`}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: theme.colour.brand,
                          }}
                        />
                      )
                    }
                    onPress={() => open(notification)}
                  />
                );
              })}
            </View>
            {connection?.pageInfo.hasNextPage ? (
              <Button
                variant="tertiary"
                testID="inbox-more"
                label={t('inbox.more')}
                onPress={() => setSize((current) => current + PAGE)}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
