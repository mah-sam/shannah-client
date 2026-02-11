import { Image } from "react-native";

const IconProvider = (source) => ({
  toReactElement: ({ animation, ...props }) => (
    <Image {...props} source={source} />
  ),
});

export const AssetIconsPack = {
  name: "assets",
  icons: {
    search: IconProvider(require("./assets/images/icons/search.png")),
    heartRounded: IconProvider(
      require("./assets/images/icons/heart-rounded.png"),
    ),
    markerPin: IconProvider(require("./assets/images/icons/marker-pin.png")),
    chevronDown: IconProvider(
      require("./assets/images/icons/chevron-down.png"),
    ),
    arrowDropdown: IconProvider(
      require("./assets/images/icons/arrow-drop-down.png"),
    ),
    filterFunnel: IconProvider(
      require("./assets/images/icons/filter-funnel.png"),
    ),
    heart: IconProvider(require("./assets/images/icons/heart.png")),
    heartFilled: IconProvider(
      require("./assets/images/icons/heart-filled.png"),
    ),
    star: IconProvider(require("./assets/images/icons/star.png")),
    home: IconProvider(require("./assets/images/icons/home.png")),
    magnifyingGlass: IconProvider(
      require("./assets/images/icons/magnifying-glass.png"),
    ),
    shoppingBag: IconProvider(
      require("./assets/images/icons/shopping-bag.png"),
    ),
    user: IconProvider(require("./assets/images/icons/user.png")),
    arrowRight: IconProvider(require("./assets/images/icons/arrow-right.png")),
    clock: IconProvider(require("./assets/images/icons/clock.png")),
    distance: IconProvider(require("./assets/images/icons/distance.png")),
    sar: IconProvider(require("./assets/images/icons/sar.png")),
    plus: IconProvider(require("./assets/images/icons/plus.png")),
    minus: IconProvider(require("./assets/images/icons/minus.png")),
    plusCircle: IconProvider(require("./assets/images/icons/plus-circle.png")),
    minusCircle: IconProvider(
      require("./assets/images/icons/minus-circle.png"),
    ),
    trash: IconProvider(require("./assets/images/icons/trash.png")),
    wallet: IconProvider(require("./assets/images/icons/wallet.png")),
    receipt: IconProvider(require("./assets/images/icons/receipt.png")),
    bankNote: IconProvider(require("./assets/images/icons/bank-note.png")),
    chevronLeft: IconProvider(
      require("./assets/images/icons/chevron-left.png"),
    ),
    eye: IconProvider(require("./assets/images/icons/eye.png")),
    eyeOff: IconProvider(require("./assets/images/icons/eye-off.png")),
    locationSolid: IconProvider(
      require("./assets/images/icons/location-solid.png"),
    ),
    favoriteOutline: IconProvider(
      require("./assets/images/icons/favorite-outline.png"),
    ),
    historyRounded: IconProvider(
      require("./assets/images/icons/history-rounded.png"),
    ),
    creditCard: IconProvider(require("./assets/images/icons/credit-card.png")),
    bell: IconProvider(require("./assets/images/icons/bell.png")),
    helpCircle: IconProvider(require("./assets/images/icons/help-circle.png")),
    globe: IconProvider(require("./assets/images/icons/globe.png")),
    logOut: IconProvider(require("./assets/images/icons/log-out.png")),
    homeOutline: IconProvider(
      require("./assets/images/icons/home-outline.png"),
    ),
    office: IconProvider(require("./assets/images/icons/office.png")),
    edit: IconProvider(require("./assets/images/icons/edit.png")),
    share: IconProvider(require("./assets/images/icons/share.png")),
  },
};
