// fontawesome.js
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";

// Prevent automatic adding of CSS since we import it manually
config.autoAddCss = false;
library.add(fas);