import {
	blue500,
	blue700,
	cyan500,
	cyan700,
	darkBlack,
	fullBlack,
	fullWhite,
	grey100,
	grey300,
	grey400,
	grey500,
	pinkA200,
	white
} from 'material-ui/styles/colors';

import { fade } from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';
import zIndex from 'material-ui/styles/zIndex';

export default {
	spacing: spacing,
	zIndex: zIndex,
	fontFamily: 'Roboto, sans-serif',
	palette: {
		primary1Color: "#5491B8",
		primary2Color: blue700,
		primary3Color: grey400,
		accent1Color: pinkA200,
		accent2Color: grey100,
		accent3Color: grey500,
		textColor: darkBlack,
		alternateTextColor: white,
		canvasColor: fullWhite,
		borderColor: grey300,
		disabledColor: fade(darkBlack, 0.3),
		pickerHeaderColor: blue700,
		clockCircleColor: fade(darkBlack, 0.07),
		shadowColor: fullBlack,
	},
};
