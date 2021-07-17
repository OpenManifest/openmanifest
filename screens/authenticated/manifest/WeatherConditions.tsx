import * as React from "react";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

import { StyleSheet, ImageBackground, Text, View } from "react-native";
import { Card, Divider, } from "react-native-paper";
import format from 'date-fns/format';
import weatherBackground from '../../../assets/images/weather.png';
import { isNumber, orderBy } from "lodash";
import useCurrentDropzone from "../../../graphql/hooks/useCurrentDropzone";
import { actions, useAppDispatch } from "../../../redux";
import useRestriction from "../../../hooks/useRestriction";
import { Permission } from "../../../graphql/schema.d";
import JumpRunMap from './JumpRun';
export default function WeatherConditions() {


  const { dropzone } = useCurrentDropzone();
  const dispatch = useAppDispatch();

  const conditions = dropzone?.currentConditions;

  const date = dropzone?.currentConditions?.createdAt
    ? new Date(dropzone?.currentConditions?.createdAt * 1000)
    : new Date();
  const jumpRun = dropzone?.currentConditions?.jumpRun || 0;
  const temperature = dropzone?.currentConditions?.temperature || 0;
  const canUpdate = useRestriction(Permission.UpdateWeatherConditions);

  const hasWeatherConditions = conditions?.id && conditions?.winds?.length && conditions?.jumpRun;
  return (
    <Card
      style={styles.card}
      onPress={() =>
        !canUpdate ? null : dispatch(actions.forms.weather.setOpen(dropzone.currentConditions))
      }
    >
      <ImageBackground
        source={weatherBackground}
        style={{...StyleSheet.absoluteFillObject }}
        resizeMode="cover"
      >
        <Card.Content>
          {
            !hasWeatherConditions
            ? <View style={styles.noData}>
                <Text style={styles.noDataLabel}>No weather data</Text>
              </View>
            : (
              <>
                <View style={styles.top}>
                  <View style={styles.cell}>
                      <FontAwesome
                        name="calendar"
                        color="#ffffff"
                        size={20}
                        style={
                          {
                            marginRight: 8,
                          }
                        }
                      />
                    <Text style={styles.date}>{format(date, 'LLL do, yy')}</Text>
                  </View>

                  <View style={[styles.cell, { justifyContent: 'flex-end', alignSelf: "flex-end" }]}>
                      <FontAwesome
                        name="thermometer"
                        color="#ffffff"
                        size={20}
                        style={{
                          marginRight: 8,
                        }}
                      />
                    <Text style={styles.temperature}>{temperature || "?"}</Text>
                    <MaterialCommunityIcons
                        name="temperature-celsius"
                        color="#ffffff"
                        size={20}
                      />
                  </View>
                </View>
                <View style={styles.bottom}>
                  <View style={styles.windboard}>
                    
                    { true ? null : <View style={styles.row}>
                      <View style={styles.cell}>
                        <Text style={[styles.header, { flex: 1/3 }]}>Temp</Text>
                        <Text style={[styles.value, { flex: 2/3 }]}>{dropzone?.currentConditions?.temperature}</Text>
                      </View>
                    </View>}
                    <View style={styles.row}>
                      <View style={styles.cell}><Text style={styles.header}>Altitude</Text></View>
                      <View style={styles.cell}><Text style={styles.header}>Wind</Text></View>
                      <View style={styles.cell}><Text style={styles.header}>Direction</Text></View>
                    </View>
                    {
                      orderBy(dropzone?.currentConditions?.winds || [], (item) => Number(item.altitude), "desc").map(({ speed: wind, direction, altitude }) =>
                        <>
                        <Divider style={{ width: '100%', backgroundColor: 'white' }} />
                        <View style={styles.row}>
                          <View style={styles.cell}><Text style={styles.value}>{altitude}</Text></View>
                          <View style={styles.cell}><Text style={styles.value}>{wind}</Text></View>
                          <View style={[styles.cell, { justifyContent: 'center'}]}>
                            <Text style={styles.value}>{direction}</Text>
                            <FontAwesome
                              name="long-arrow-down"
                              size={14}
                              style={
                                direction && /\d+/.test(direction) && Number(direction) < 361 ?
                                {
                                  transform: [{
                                    rotate: `${direction}deg`
                                  }],
                                  marginLeft: 4,
                                }
                                : { marginLeft: 4, }
                              }
                            />
                          </View>
                          
                        </View>
                        </>
                      )
                    }
                  
                  </View>
                  <View style={styles.jumpRun}>
                    <Text style={[styles.header, { textAlign: 'center' }]}>
                      Jump run {jumpRun}&deg;
                    </Text>
                    <View style={{ width: '100%', height: '100%' }}>
                      <JumpRunMap jumpRun={jumpRun} />
                    </View>
                  </View>
                </View>
              </>
            )}

          </Card.Content>
      </ImageBackground>
      
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    borderRadius: 10,
    marginBottom: 30,
    marginHorizontal: 16,
    height: 200,
    overflow: "hidden",
  },
  date: {
    flex: 1,
    fontSize: 20,
    color: 'white',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 5,
    textShadowColor: 'rgba(15, 15, 15, 0.5)'
  },
  temperature: {
    fontSize: 24,
    lineHeight: 24,
    color: 'white',
    justifyContent: 'flex-end',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 5,
    textShadowColor: 'rgba(15, 15, 15, 0.5)'
  },
  label: {
    color: 'white',
    fontWeight: 'bold'
  },
  value: {
    color: '#ffffff',
    textShadowOffset: {
      width: 2,
      height: 2
    },
    textShadowRadius: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)'
  },
  row: {
    alignItems: "center",
    justifyContent: "space-evenly",
    height: 20,
    
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    color: 'white',
    flexDirection: "row"
  },
  header: {
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)'
  },
  noData: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    textAlign: 'center',
    alignSelf: 'center',
    height: "100%"
  },
  noDataLabel: {
    color: '#ffffff',
    textShadowOffset: {
      width: 2,
      height: 2
    },
    textShadowRadius: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    fontSize: 22,
  },
  top: {
    marginTop: 16,
    justifyContent: 'space-between',
    alignItems: "center",
    flexDirection: "row",
  },
  bottom: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "flex-end",
    flexGrow: 1,
    height: 105,
    marginTop: 32,
  },
  windboard: {
    width: 200,
    height: 105,
    flexDirection: "column",
  },
  jumpRun: {
    width: 105,
    height: 105,
    flexDirection: 'column',
    alignItems: 'flex-end',
  }
});