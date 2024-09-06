import {Dimensions, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    ['main-view']: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ['stats']: {
        position: 'absolute',
        top: 50,
        left: 10,
    },
});

export default styles;

export const screenSize = Dimensions.get('window');

export const center = {
    x: screenSize.width / 2,
    y: screenSize.height / 2,
};