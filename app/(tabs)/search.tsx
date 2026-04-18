// @ts-nocheck
import { Button, Input, Layout, Spinner, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { SearchIcon } from "../../components/Icons";
import { EmptyState } from "../../components/ui/EmptyState";
import { IMAGE_BLURHASH, IMAGE_TRANSITION_MS } from "../../constants/images";
import { search, searchTags } from "../../services/shannahApi";
import * as theme from "../../theme.json";

const Search = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchText, setSeachText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await searchTags();
      setTags(result.data);
    })();
  }, []);

  useEffect(() => {
    if (searchText.trim().length < 2) {
      setSearchResult([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      const result = await search(searchText);
      setLoading(false);
      setSearchResult(result.data);
    }, 400);

    return () => clearTimeout(t);
  }, [searchText]);

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets?.top,
          }}
        >
          <View style={styles.searchInputContainer}>
            {searchText.length === 0 && (
              <Text style={styles.searchInputPlaceholder}>
                ابحث عن الطعام والوجبات والولائم
              </Text>
            )}
            <Input
              status="basic"
              textStyle={styles.searchInputText}
              accessoryLeft={() => (
                <SearchIcon
                  style={
                    searchFocused ? styles.searchIconFocused : styles.searchIcon
                  }
                />
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              value={searchText}
              onChangeText={(t) => setSeachText(t)}
              autoFocus={true}
            />
          </View>
          <View style={styles.searchContainer}>
            {loading && (
              <View style={styles.searchLoadingContainer}>
                <Spinner />
              </View>
            )}

            {!loading && searchText.trim().length >= 2 && searchResult.length === 0 && (
              <EmptyState
                compact
                title="لا توجد نتائج"
                subtitle="جرّب كلمات بحث مختلفة"
              />
            )}

            {!loading && searchResult.length > 0 && (
              <View style={styles.searchResultContainer}>
                {searchResult.map((store) => (
                  <Pressable
                    key={store.id}
                    onPress={() => router.navigate(`/store/${store.id}`)}
                  >
                    <View style={styles.searchResultRow}>
                      <Image
                        source={{ uri: store.logo }}
                        contentFit="cover"
                        placeholder={{ blurhash: IMAGE_BLURHASH }}
                        transition={IMAGE_TRANSITION_MS}
                        style={styles.searchResultImage}
                      />
                      <Text category="s2" style={styles.searchResultText}>
                        {store.name}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.topSearchContainer}>
              <Text category="s1" style={styles.titleText}>
                الأكثر بحثاً
              </Text>
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Button
                    key={index}
                    appearance="outline"
                    status="basic"
                    size="tiny"
                    onPress={() => setSeachText(tag)}
                  >
                    {(evaProps) => <Text style={styles.tagText}>{tag}</Text>}
                  </Button>
                ))}
              </View>
            </View>
          </View>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInputContainer: {
    paddingHorizontal: 16,
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
    textAlign: "right",
  },
  searchInputPlaceholder: {
    position: "absolute",
    top: 12,
    left: 60,
    fontSize: 16,
    color: theme["text-body-color"],
    zIndex: 1,
  },
  searchContainer: {
    paddingVertical: 12,
  },
  searchResultContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  searchLoadingContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 36,
  },
  searchResultImage: {
    width: 36,
    height: 36,
    backgroundColor: theme["color-primary-50"],
    borderRadius: 4,
  },
  searchResultText: {
    color: theme["text-heading-color"],
  },
  topSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  titleText: {
    color: theme["text-heading-color"],
    textAlign: "left",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  tagText: {
    color: theme["text-body-color"],
  },
});

export default Search;
