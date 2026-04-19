// @ts-nocheck
import { Button, Input, Layout, Spinner, Text } from "@ui-kitten/components";
import axios from "axios";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  HomeOutlineIcon,
  MarkerPinIcon,
  OfficeIcon,
  PlusIcon,
  SearchIcon,
} from "../../components/Icons";
import BottomActionBar from "../../components/ui/BottomActionBar";
import useAuth from "../../hooks/useAuth";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
import useKeyboard from "../../hooks/useKeyboard";
import { getAddress, saveOrUpdateAddress } from "../../services/shannahApi";
import * as theme from "../../theme.json";

export default function Form() {
  const { token } = useAuth();
  const { action, id } = useLocalSearchParams();
  const { location, loading, error, refresh } = useCurrentLocation();
  const [coords, setCoords] = useState(null);
  const [searchText, setSeachText] = useState("");
  const [address, setAddress] = useState(null);
  const [results, setResults] = useState([]);
  const mapRef = useRef(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [buildingNo, setBuildingNo] = useState("");
  const [streetNo, setStreetNo] = useState("");
  const streetInputRef = useRef(null);
  const [selectedLabelIndex, setSelectedLabelIndex] = useState(null);
  const [label, setLabel] = useState("");
  const [isLoading, setIsLoading] = useState(action === "edit");
  const isEditMode = action === "edit";
  const { keyboardOpen } = useKeyboard();
  const [hasRetriedLocation, setHasRetriedLocation] = useState(false);
  const initializedAddressRef = useRef(false);

  const initErrors = {
    label: null,
    street: null,
    building_no: null,
    national_address: null,
  };

  const [errors, setErrors] = useState(initErrors);

  const labels = [
    {
      name: "المنزل",
      icon: () => <HomeOutlineIcon style={styles.labelIcon}></HomeOutlineIcon>,
    },
    {
      name: "المكتب",
      icon: () => <OfficeIcon style={styles.labelIcon}></OfficeIcon>,
    },
    {
      name: "أخرى",
      icon: () => <PlusIcon style={styles.labelIcon}></PlusIcon>,
    },
  ];

  // Load existing address data when in edit mode
  useEffect(() => {
    if (isEditMode && id && token) {
      loadAddressData();
    }
  }, [isEditMode, id, token]);

  const loadAddressData = async () => {
    try {
      const result = await getAddress(token, id);
      if (result.data) {
        const addressData = result.data;
        setBuildingNo(addressData.building_no || "");
        setStreetNo(addressData.street || "");

        // Set label
        const labelIndex = labels.findIndex(
          (l) => l.name === addressData.label,
        );
        if (labelIndex !== -1) {
          setSelectedLabelIndex(labelIndex);
          setLabel("");
        } else {
          setSelectedLabelIndex(labels.length - 1);
          setLabel(addressData.label || "");
        }

        // Backend renamed lat/lng → latitude/longitude. Prefer new keys, fall
        // back to legacy keys so the form works during the rename rollout.
        const apiLat = addressData.latitude ?? addressData.lat;
        const apiLng = addressData.longitude ?? addressData.lng;

        setCoords({
          latitude: parseFloat(apiLat),
          longitude: parseFloat(apiLng),
        });

        setAddress({
          lat: apiLat,
          lon: apiLng,
          name: null,
          displayName: addressData.national_address,
          address: {
            city: addressData.city,
            neighbourhood: addressData.area,
          },
        });

        setLocationConfirmed(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading address:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditMode && !location) return;
    if (isEditMode) return; // Skip location update in edit mode

    setCoords({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    // Initialize address on first render with location
    if (!initializedAddressRef.current) {
      initializedAddressRef.current = true;
      reverseGeocode(location.latitude, location.longitude);
    }
  }, [location, isEditMode]);

  useEffect(() => {
    const t = setTimeout(() => searchLocation(searchText), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => {
    if (error === "Failed to get current location" && !hasRetriedLocation) {
      setHasRetriedLocation(true);
      refresh();
    }
  }, [error, hasRetriedLocation, refresh]);

  async function searchLocation(text) {
    if (text.trim().length < 3) {
      setResults([]);
      return;
    }

    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&accept-language=ar-SA&countrycodes=sa&addressdetails=1&q=${encodeURIComponent(
        text,
      )}`,
      {
        headers: {
          "User-Agent": `${Constants.expoConfig.name}/${Constants.expoConfig.version} (eng.alagha@gmail.com)`,
        },
      },
    );

    setResults(res.data);
  }

  function selectResult(item) {
    const latitude = parseFloat(item.lat);
    const longitude = parseFloat(item.lon);

    setCoords({ latitude, longitude });
    setResults([]);
    setSeachText("");

    mapRef.current?.animateCamera({
      center: { latitude, longitude },
      zoom: 16,
    });
  }

  const onSaveAddress = async () => {
    const addressLabel =
      selectedLabelIndex !== null && selectedLabelIndex < labels.length - 1
        ? labels[selectedLabelIndex].name
        : label;

    const city =
      address.address.city ||
      address.address.town ||
      address.address.village ||
      address.address.municipality ||
      null;

    const area =
      address.address.neighbourhood ||
      address.address.suburb ||
      address.address.quarter ||
      address.address.hamlet ||
      null;

    // Send both new (latitude/longitude) and legacy (lat/lng) keys so the
    // payload works against either backend version. Laravel ignores unknown
    // keys at mass-assignment, so the inactive pair is a harmless no-op.
    const data = {
      label: addressLabel,
      city: city,
      area: area,
      street: streetNo,
      building_no: buildingNo,
      latitude: address.lat,
      longitude: address.lon,
      lat: address.lat,
      lng: address.lon,
      national_address: address.displayName,
      is_default: !isEditMode, // Only set as default for new addresses
    };

    const res = await saveOrUpdateAddress(
      token,
      data,
      isEditMode ? "update" : "create",
      isEditMode ? id : null,
    );

    if (res.errors) {
      setErrors({ ...initErrors, ...res.errors });
    } else if (res.status) {
      router.back();
    }
  };

  async function reverseGeocode(lat, lon) {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=ar-SA&addressdetails=1&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": `${Constants.expoConfig.name}/${Constants.expoConfig.version} (eng.alagha@gmail.com)`,
        },
      },
    );

    setAddress({
      lat: res.data.lat,
      lon: res.data.lon,
      name: res.data.name ?? null,
      displayName: res.data.display_name ?? null,
      address: res.data.address,
    });
  }

  const onUseCurrentLocation = () => {
    if (mapRef.current && location) {
      const latitude = location.latitude;
      const longitude = location.longitude;

      mapRef.current.animateToRegion(
        {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        1000,
      );
    }
  };

  const MapPreview = useCallback(({ coords, address }) => {
    return (
      <View style={{ gap: 16 }}>
        <View style={styles.map}>
          {coords === null ? (
            <Spinner></Spinner>
          ) : (
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              defaultCamera={{
                center: coords,
                zoom: 16,
              }}
              showsUserLocation
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              onRegionChangeComplete={(r) => {
                if (
                  typeof r.latitude === "number" &&
                  typeof r.longitude === "number"
                ) {
                  setCoords({
                    latitude: r.latitude,
                    longitude: r.longitude,
                  });

                  reverseGeocode(r.latitude, r.longitude);
                }
              }}
            >
              <Marker coordinate={coords} tracksViewChanges={false} />
            </MapView>
          )}
        </View>
        {address && (
          <View style={styles.preview}>
            <View style={styles.addressContainer}>
              <MarkerPinIcon style={styles.markerPinIcon}></MarkerPinIcon>
              <View style={styles.address}>
                <Text category="s2" style={{ textAlign: "left" }}>
                  {address.name}
                </Text>
                <Text style={styles.addressDetails}>{address.displayName}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }, []);

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) =>
        locationConfirmed ? (
          <Layout
            style={{
              ...styles.locationConfirmedContainer,
              paddingBottom: insets?.bottom,
            }}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Spinner></Spinner>
              </View>
            ) : (
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                enabled={keyboardOpen}
                keyboardVerticalOffset={89}
              >
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.locationConfirmedContainer}
                >
                  <MapPreview coords={coords} address={address}></MapPreview>
                  <View style={styles.addressForm}>
                    <Input
                      status={
                        errors.building_no === null ? "primary" : "danger"
                      }
                      label={() => (
                        <Text style={styles.labelText}>رقم المبنى</Text>
                      )}
                      textStyle={styles.inputText}
                      value={buildingNo}
                      onChangeText={(t) => setBuildingNo(t)}
                      caption={
                        errors.building_no === null ? "" : errors.building_no[0]
                      }
                      returnKeyType="next"
                      onSubmitEditing={() => streetInputRef.current?.focus()}
                      blurOnSubmit={false}
                      keyboardType="default"
                    />
                    <Input
                      ref={streetInputRef}
                      status={errors.street === null ? "primary" : "danger"}
                      label={() => <Text style={styles.labelText}>الشارع</Text>}
                      textStyle={styles.inputText}
                      value={streetNo}
                      onChangeText={(t) => setStreetNo(t)}
                      caption={errors.street === null ? "" : errors.street[0]}
                      returnKeyType="done"
                    />
                    <Text style={styles.addressFormLabel}>أضف تسمية</Text>
                    <ScrollView
                      horizontal={true}
                      style={{ maxHeight: 32 }}
                      contentContainerStyle={styles.labelButtonsContainer}
                    >
                      {labels.map((label, index) => (
                        <Button
                          key={index}
                          appearance="outline"
                          status={
                            selectedLabelIndex === index ? "primary" : "basic"
                          }
                          size="tiny"
                          style={styles.labelButton}
                          onPress={() => {
                            setSelectedLabelIndex(index);
                            setLabel("");
                            setErrors({ ...initErrors, label: null });
                          }}
                          accessoryLeft={label.icon}
                        >
                          <View>
                            <Text>{label.name}</Text>
                          </View>
                        </Button>
                      ))}
                    </ScrollView>
                    {selectedLabelIndex === labels.length - 1 && (
                      <View>
                        {label.length === 0 && (
                          <Text style={styles.labelInoutPlaceholder}>
                            أدخل التسمية هنا...
                          </Text>
                        )}
                        <Input
                          status={errors.label === null ? "primary" : "danger"}
                          textStyle={styles.inputText}
                          value={label}
                          onChangeText={(t) => setLabel(t)}
                          caption={errors.label === null ? "" : errors.label[0]}
                          style={{ flex: 1 }}
                        />
                      </View>
                    )}
                    {selectedLabelIndex === null && errors.label !== null && (
                      <Text
                        style={{ color: theme["color-red"], lineHeight: 12 }}
                      >
                        {errors.label}
                      </Text>
                    )}
                  </View>
                </ScrollView>
                <BottomActionBar>
                  <Button
                    disabled={address === null}
                    onPress={() => onSaveAddress()}
                  >
                    <View>
                      <Text category="s1" status="control">
                        {isEditMode ? "تحديث العنوان" : "حفظ العنوان"}
                      </Text>
                    </View>
                  </Button>
                </BottomActionBar>
              </KeyboardAvoidingView>
            )}
          </Layout>
        ) : (
          <Layout
            style={{
              ...styles.container,
              paddingBottom: insets?.bottom,
            }}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Spinner></Spinner>
              </View>
            ) : (
              <>
                <MapPreview coords={coords} address={address}></MapPreview>
                <View style={styles.searchContainer}>
                  <View>
                    {searchText.length === 0 && (
                      <Text style={styles.searchInputPlaceholder}>
                        أدخل عنوانك هنا...
                      </Text>
                    )}
                    <Input
                      textStyle={styles.searchInputText}
                      accessoryLeft={() => (
                        <SearchIcon style={styles.searchIcon} />
                      )}
                      value={searchText}
                      onChangeText={(t) => setSeachText(t)}
                    />
                  </View>

                  {results.length > 0 ? (
                    <ScrollView
                      style={styles.searchResultScroll}
                      contentContainerStyle={styles.searchResultContainer}
                    >
                      {results.map((result, index) => (
                        <Pressable
                          key={index}
                          style={styles.addressContainer}
                          onPress={() => selectResult(result)}
                        >
                          <MarkerPinIcon
                            style={styles.markerPinIcon}
                          ></MarkerPinIcon>
                          <View style={styles.address}>
                            <Text category="s2" style={{ textAlign: "left" }}>
                              {result.name}
                            </Text>
                            <Text style={styles.addressDetails}>
                              {result.display_name}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  ) : (
                    <ScrollView
                      style={{ flex: 1 }}
                      contentContainerStyle={{
                        flexGrow: 1,
                        gap: 16,
                      }}
                    >
                      <Image
                        source={require("../../assets/images/map.png")}
                        style={styles.mapImage}
                      ></Image>
                      <Text style={styles.mapPlaceholderText}>
                        أدخل عنوانك لاستكشاف المطابخ القريبة منك
                      </Text>
                      <Button
                        appearance="ghost"
                        onPress={() => {
                          onUseCurrentLocation();
                        }}
                      >
                        {(evaProps) => (
                          <Text category="s1" status="primary">
                            استخدام الموقع الحالي
                          </Text>
                        )}
                      </Button>
                    </ScrollView>
                  )}
                </View>
                <BottomActionBar>
                  <Button
                    disabled={address === null}
                    onPress={() => setLocationConfirmed(true)}
                  >
                    {(evaProps) => (
                      <Text category="s1" status="control">
                        تأكيد الموقع
                      </Text>
                    )}
                  </Button>
                </BottomActionBar>
              </>
            )}
          </Layout>
        )
      }
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  locationConfirmedContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    height: 204,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: theme["text-body-color"],
  },
  searchIconFocused: {
    width: 20,
    height: 20,
    tintColor: theme["color-black"],
    marginRight: 4,
  },
  searchInputText: {
    color: theme["color-black"],
    fontSize: 16,
  },
  searchInputPlaceholder: {
    position: "absolute",
    top: 12,
    left: 44,
    fontSize: 16,
    color: theme["text-body-color"],
    zIndex: 1,
  },
  searchResultScroll: {
    flex: 1,
  },
  searchResultContainer: {
    gap: 12,
    flexGrow: 1,
  },
  addressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  markerPinIcon: {
    width: 24,
    height: 24,
    tintColor: theme["text-body-color"],
  },
  address: {
    gap: 3,
  },
  addressDetails: {
    color: theme["text-body-color"],
    lineHeight: 16,
    textAlign: "left",
  },
  preview: {
    paddingHorizontal: 16,
  },
  locationConfirmedContainer: {
    flexGrow: 1,
    paddingBottom: 9,
  },
  inputText: {
    color: theme["color-black"],
    fontSize: 16,
  },
  labelText: {
    color: theme["color-black"],
    lineHeight: 18,
    textAlign: "left",
  },
  addressForm: {
    padding: 16,
    gap: 12,
  },
  addressFormLabel: {
    color: theme["text-heading-color"],
    textAlign: "left",
  },
  labelButtonsContainer: {
    gap: 8,
  },
  labelButton: {
    alignSelf: "flex-start",
  },
  labelIcon: {
    width: 16,
    height: 16,
    tintColor: theme["color-primary-500"],
  },
  labelInoutPlaceholder: {
    position: "absolute",
    top: 10,
    left: 20,
    fontSize: 16,
    color: theme["text-body-color"],
    zIndex: 1,
  },
  mapImage: {
    width: 128,
    height: 130,
    alignSelf: "center",
  },
  mapPlaceholderText: {
    color: theme["text-body-color"],
    textAlign: "center",
  },
});
