import {PanResponder, Text, View} from "react-native";
import Svg, {Circle, Line} from "react-native-svg";
import mainStyle, {screenSize, center} from "@/styles/main.style";
import {
    MultipleR,
    point,
    point2D, Quaternion,
    R,
    rotateXYZ,
    rotationAxis,
} from "@/logics/rotations";
import {getBindingIdentifiers} from "@babel/types";
import {useRef, useState} from "react";

export default function App() {
    const [ universalRotation, setUniversalRotation ] = useState(new Quaternion(1, 0, 0, 0));

    const initialReference = useRef({ x: 0, y: 0 }).current;
    const initialRotations = useRef({ x: 0, y: 0, z: 0 });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                // Guarda el punto inicial al presionar
                initialReference.x = evt.nativeEvent.locationX;
                initialReference.y = evt.nativeEvent.locationY;
                // setReferences(prevReferences => {
                //     initialRotations.current.x = prevReferences.x.theta;
                //     initialRotations.current.y = prevReferences.y.theta;
                //     initialRotations.current.z = prevReferences.z.theta;
                //     return prevReferences;
                // });
            },
            onPanResponderMove: (evt, gestureState) => {
                // Mueve el segundo punto según la posición del dedo (opcional si deseas mostrar algo visualmente)
                const deltaX = evt.nativeEvent.locationX - initialReference.x;
                const deltaY = evt.nativeEvent.locationY - initialReference.y;

                setUniversalRotation(prevState => {
                    // Aplica rotaciones sobre los ejes globales
                    const rotationX = Quaternion.fromAxisAngle({ x: 1, y: 0, z: 0 }, deltaY * 0.01); // Eje X global
                    const rotationY = Quaternion.fromAxisAngle({ x: 0, y: 1, z: 0 }, deltaX * 0.01); // Eje Y global
                    const fixedRotation = rotationX.multiply(rotationY);

                    // En lugar de acumular rotaciones en el estado previo, combinamos las nuevas rotaciones de forma independiente
                    return fixedRotation.multiply(prevState);
                });

                initialReference.x = evt.nativeEvent.locationX;
                initialReference.y = evt.nativeEvent.locationY;
            },
            onPanResponderRelease: (evt, gestureState) => {
            },
        })
    ).current;

    return (
    <View
    style={mainStyle["main-view"]}
    {...panResponder.panHandlers}
    >
        {/*<Text style={{...mainStyle.stats, top: 80}}>*/}
        {/*    Rotation: {references.x.theta.toFixed(2)} {references.y.theta.toFixed(2)}*/}
        {/*</Text>*/}
        {/*<Text style={{...mainStyle.stats, top: 100}}>*/}
        {/*    Reference: {JSON.stringify(references)}*/}
        {/*</Text>*/}
        <Svg>
            <RenderDot coordinates={{ x: 0, y: 0, z: 0 }} rotationAxis={universalRotation} color="black" />
            <RenderDot coordinates={{ x: 10, y: 0, z: 0 }} rotationAxis={universalRotation} color="red" />
            <RenderDot coordinates={{ x: 0, y: 10, z: 0 }} rotationAxis={universalRotation} color="green" />
            <RenderDot coordinates={{ x: 0, y: 0, z: 10 }} rotationAxis={universalRotation} color="blue" />

            {/*<Circle cx={center.x + universalRotation.toPoint().x * 20} cy={center.y - universalRotation.toPoint().y * 20} r={3} fill="black" />*/}
        </Svg>
    </View>
    );
}

function RenderDot(args: {
    coordinates: point,
    rotationAxis: Quaternion,
    color: string,
}) {
    const { coordinates, rotationAxis, color } = args;
    const rotation = MultipleR(rotationAxis, coordinates);
    return <Circle cx={center.x + rotation.x} cy={center.y - rotation.y} r={1 + rotation.z/10} fill={color} />;
}