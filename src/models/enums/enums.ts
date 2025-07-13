
export enum ValidationStatus {
    Valid = 0,
    Intersection,
    TooShort,
    InvalidCoordinates
}

export enum CrossRoadAngle {
    LeftTop = 1,
    RightTop,
    LeftBottom,
    RightBottom
}

export enum AppMode {
    Edit = 'edit',
    Simulation = 'simulation',
}

export enum NotificationCacheOptions {
    Last5 = 5,
    Last10 = 10,
    Last25 = 25,
    Last50 = 50,
    Last100 = 100,
    All = Infinity
} 
