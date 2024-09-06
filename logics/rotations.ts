
export interface point {
    x: number;
    y: number;
    z: number;
}

export interface point2D {
    x: number;
    y: number;
}

export type rotationAxis = point & { theta: number, };

function rotateX(point: point, angle: number) {
    const { x, y, z } = point;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatedY = y * cos - z * sin;
    const rotatedZ = y * sin + z * cos;
    return { x, y: rotatedY, z: rotatedZ };
}

function rotateY(point: point, angle: number) {
    const { x, y, z } = point;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatedX = x * cos + z * sin;
    const rotatedZ = -x * sin + z * cos;
    return { x: rotatedX, y, z: rotatedZ };
}

function rotateZ(point: point, angle: number) {
    const { x, y, z } = point;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;
    return { x: rotatedX, y: rotatedY, z };
}

export function rotateXYZ(point: point, rx: number, ry: number, rz: number) {
    const rotatedX = rotateX(point, rx);
    const rotatedY = rotateY(rotatedX, ry);
    return rotateZ(rotatedY, rz);
}

export function R(theta: number, u: point, v: point) {
    const { x: ux, y: uy, z: uz } = u;  // Eje de rotación
    const { x: vx, y: vy, z: vz } = v;  // Vector a rotar
    const cos = Math.cos(theta);        // Coseno del ángulo de rotación
    const sin = Math.sin(theta);        // Seno del ángulo de rotación
    const oneMinusCos = 1 - cos;        // (1 - cos(theta)) usado varias veces

    // Rotación general 3D con matriz de rotación para el eje u = (ux, uy, uz)
    const xPrime =
        (cos + ux * ux * oneMinusCos) * vx +
        (ux * uy * oneMinusCos - uz * sin) * vy +
        (ux * uz * oneMinusCos + uy * sin) * vz;

    const yPrime =
        (uy * ux * oneMinusCos + uz * sin) * vx +
        (cos + uy * uy * oneMinusCos) * vy +
        (uy * uz * oneMinusCos - ux * sin) * vz;

    const zPrime =
        (uz * ux * oneMinusCos - uy * sin) * vx +
        (uz * uy * oneMinusCos + ux * sin) * vy +
        (cos + uz * uz * oneMinusCos) * vz;

    // Retorna el nuevo vector rotado (x', y', z')
    return { x: xPrime, y: yPrime, z: zPrime };
}

export class Quaternion {
    w: number;
    x: number;
    y: number;
    z: number;

    constructor(w: number, x: number, y: number, z: number) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromAxisAngle(axis: point, angle: number) {
        const halfAngle = angle / 2;
        const sin = Math.sin(halfAngle);
        return new Quaternion(Math.cos(halfAngle), axis.x * sin, axis.y * sin, axis.z * sin);
    }

    multiply(q: Quaternion) {
        const w = this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z;
        const x = this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y;
        const y = this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x;
        const z = this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w;
        return new Quaternion(w, x, y, z);
    }

    inverse() {
        return new Quaternion(this.w, -this.x, -this.y, -this.z);
    }

    static fromPoint(point: point) {
        return new Quaternion(0, point.x, point.y, point.z);
    }

    toPoint() {
        return { x: this.x, y: this.y, z: this.z };
    }

    static multiply(...quaternions: Quaternion[]) {
        return quaternions.reduce((acc, q) => acc.multiply(q), new Quaternion(1, 0, 0, 0));
    }

    unit() {
        const magnitude = Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
        return new Quaternion(this.w / magnitude, this.x / magnitude, this.y / magnitude, this.z / magnitude);
    }

    subdivide(parts: number) {
        const angle = Math.acos(this.w) * 2;
        const axis = { x: this.x, y: this.y, z: this.z };
        const step = angle / parts;
        return Array.from({ length: parts }, (_, i) => Quaternion.fromAxisAngle(axis, step));
    }

}

export function MultipleR(axis: Quaternion, v: point) {
    // const qn = axis.flatMap((axis) => Quaternion.fromAxisAngle(axis, axis.theta).unit().subdivide(10));
    const qn = [axis.unit()];
    const qv = Quaternion.fromPoint(v);
    const q_total = Quaternion.multiply(...qn.reverse());
    const v_prime = q_total.multiply(qv).multiply(q_total.inverse()).toPoint();
    return v_prime;
}