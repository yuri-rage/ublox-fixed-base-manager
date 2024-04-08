/**
 * Complete list of UBX messages from the ZedF-9P Interface Description
 * @see {@link https://content.u-blox.com/sites/default/files/documents/u-blox-F9-HPG-L1L5-1.40_InterfaceDescription_UBX-23006991.pdf}
 * @namespace UBX
 */
export namespace UBX {
    /**
     * Acknowledgement and negative acknowledgement messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum ACK {
        /**
         * ACK message class identifier.
         * @type {number}
         */
        CLASS = 0x05,

        /**
         * Message not acknowledged. (Output)
         * @type {number}
         */
        NAK = 0x00,

        /**
         * Message acknowledged. (Output)
         * @type {number}
         */
        ACK = 0x01,
    }

    /**
     * Configuration and command messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum CFG {
        /**
         * CFG message class identifier.
         * @type {number}
         */
        CLASS = 0x06,

        /**
         * Antenna control settings. (Get/set)
         * @type {number}
         */
        ANT = 0x13,

        /**
         * Clear, save, and load configurations. (Command)
         * @type {number}
         */
        CFG = 0x09,

        /**
         * Set user-defined datum. (Set)
         * @type {number}
         */
        DAT = 0x06,

        /**
         * DGNSS configuration. (Get/set)
         * @type {number}
         */
        DGNSS = 0x70,

        /**
         * Geofencing configuration. (Get/set)
         * @type {number}
         */
        GEOFENCE = 0x69,

        /**
         * GNSS system configuration. (Get/set)
         * @type {number}
         */
        GNSS = 0x3e,

        /**
         * Poll configuration for one protocol. (Poll request)
         * @type {number}
         */
        INF = 0x02,

        /**
         * Data logger configuration. (Get/set)
         * @type {number}
         */
        LOGFILTER = 0x47,

        /**
         * Poll a message configuration. (Poll request)
         * @type {number}
         */
        MSG = 0x01,

        /**
         * Navigation engine settings. (Get/set)
         * @type {number}
         */
        NAV5 = 0x24,

        /**
         * Navigation engine expert settings. (Get/set)
         * @type {number}
         */
        NAVX5 = 0x23,

        /**
         * Extended NMEA protocol configuration V1. (Get/set)
         * @type {number}
         */
        NMEA = 0x17,

        /**
         * Odometer, low-speed COG engine settings. (Get/set)
         * @type {number}
         */
        ODO = 0x1e,

        /**
         * Polls the configuration for one I/O port. (Poll request)
         * @type {number}
         */
        PRT = 0x00,

        /**
         * Put receiver in a defined power state. (Set)
         * @type {number}
         */
        PWR = 0x57,

        /**
         * Navigation/measurement rate settings. (Get/set)
         * @type {number}
         */
        RATE = 0x08,

        /**
         * Contents of remote inventory. (Get/set)
         * @type {number}
         */
        RINV = 0x34,

        /**
         * Reset receiver / Clear backup data structures. (Command)
         * @type {number}
         */
        RST = 0x04,

        /**
         * SBAS configuration. (Get/set)
         * @type {number}
         */
        SBAS = 0x16,

        /**
         * Time mode settings 3. (Get/set)
         * @type {number}
         */
        TMODE3 = 0x71,

        /**
         * Time pulse parameters. (Get/set)
         * @type {number}
         */
        TP5 = 0x31,

        /**
         * USB configuration. (Get/set)
         * @type {number}
         */
        USB = 0x1b,

        /**
         * Delete configuration item values. (Set)
         * @type {number}
         */
        VALDEL = 0x8c,

        /**
         * Get configuration items. (Poll request)
         * @type {number}
         */
        VALGET = 0x8b,

        /**
         * Set configuration item values. (Set)
         * @type {number}
         */
        VALSET = 0x8a,
    }

    /**
     * Information messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum INF {
        /**
         * INF message class identifier.
         * @type {number}
         */
        CLASS = 0x04,

        /**
         * ASCII output with debug contents. (Output)
         * @type {number}
         */
        DEBUG = 0x04,

        /**
         * ASCII output with error contents. (Output)
         * @type {number}
         */
        ERROR = 0x00,

        /**
         * ASCII output with informational contents. (Output)
         * @type {number}
         */
        NOTICE = 0x02,

        /**
         * ASCII output with test contents. (Output)
         * @type {number}
         */
        TEST = 0x03,

        /**
         * ASCII output with warning contents. (Output)
         * @type {number}
         */
        WARNING = 0x01,
    }

    /**
     * Logging messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum LOG {
        /**
         * LOG message class identifier.
         * @type {number}
         */
        CLASS = 0x21,

        /**
         * Create log file. (Command)
         * @type {number}
         */
        CREATE = 0x07,

        /**
         * Erase logged data. (Command)
         * @type {number}
         */
        ERASE = 0x03,

        /**
         * Find index of a log entry based on a given time. (Input)
         * @type {number}
         */
        FINDTIME = 0x0e,

        /**
         * Poll for log information. (Poll request)
         * @type {number}
         */
        INFO = 0x08,

        /**
         * Request log data. (Command)
         * @type {number}
         */
        RETRIEVE = 0x09,

        /**
         * Position fix log entry. (Output)
         * @type {number}
         */
        RETRIEVEPOS = 0x0b,

        /**
         * Odometer log entry. (Output)
         * @type {number}
         */
        RETRIEVEPOSEXTRA = 0x0f,

        /**
         * Byte string log entry. (Output)
         * @type {number}
         */
        RETRIEVESTRING = 0x0d,

        /**
         * Store arbitrary string in on-board flash. (Command)
         * @type {number}
         */
        STRING = 0x04,
    }

    /**
     * Monitoring messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum MGA {
        /**
         * MGA message class identifier.
         * @type {number}
         */
        CLASS = 0x13,

        /**
         * Multiple GNSS acknowledge message. (Output)
         * @type {number}
         */
        ACK = 0x60,

        /**
         * BeiDou ephemeris assistance for satellites svId 1..37. (Input)
         * @type {number}
         */
        BDS = 0x03,

        /**
         * Poll the navigation database. (Poll request)
         * @type {number}
         */
        DBD = 0x80,

        /**
         * Galileo ephemeris assistance. (Input)
         * @type {number}
         */
        GAL = 0x02,

        /**
         * GLONASS ephemeris assistance. (Input)
         * @type {number}
         */
        GLO = 0x06,

        /**
         * GPS ephemeris assistance. (Input)
         * @type {number}
         */
        GPS = 0x00,

        /**
         * Initial position assistance. (Input)
         * @type {number}
         */
        INI = 0x40,

        /**
         * QZSS ephemeris assistance. (Input)
         * @type {number}
         */
        QZSS = 0x05,
    }

    /**
     * Monitoring messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum MON {
        /**
         * MON message class identifier.
         * @type {number}
         */
        CLASS = 0x0a,

        /**
         * Communication port information. (Periodic/polled)
         * @type {number}
         */
        COMMS = 0x36,

        /**
         * Information message major GNSS selection. (Polled)
         * @type {number}
         */
        GNSS = 0x28,

        /**
         * Hardware status. (Periodic/polled)
         * @type {number}
         */
        HW = 0x09,

        /**
         * Extended hardware status. (Periodic/polled)
         * @type {number}
         */
        HW2 = 0x0b,

        /**
         * I/O pin status. (Periodic/polled)
         * @type {number}
         */
        HW3 = 0x37,

        /**
         * I/O system status. (Periodic/polled)
         * @type {number}
         */
        IO = 0x02,

        /**
         * Message parse and process status. (Periodic/polled)
         * @type {number}
         */
        MSGPP = 0x06,

        /**
         * Installed patches. (Polled)
         * @type {number}
         */
        PATCH = 0x27,

        /**
         * RF information. (Periodic/polled)
         * @type {number}
         */
        RF = 0x38,

        /**
         * Receiver buffer status. (Periodic/polled)
         * @type {number}
         */
        RXBUF = 0x07,

        /**
         * Receiver status information. (Output)
         * @type {number}
         */
        RXR = 0x21,

        /**
         * Signal characteristics. (Periodic/polled)
         * @type {number}
         */
        SPAN = 0x31,

        /**
         * Current system performance information. (Periodic/polled)
         * @type {number}
         */
        SYS = 0x39,

        /**
         * Transmitter buffer status. (Periodic/polled)
         * @type {number}
         */
        TXBUF = 0x08,

        /**
         * Poll receiver and software version. (Poll request)
         * @type {number}
         */
        VER = 0x04,
    }

    /**
     * Navigation solution messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum NAV {
        /**
         * NAV message class identifier.
         * @type {number}
         */
        CLASS = 0x01,

        /**
         * Clock solution. (Periodic/polled)
         * @type {number}
         */
        CLOCK = 0x22,

        /**
         * Covariance matrices. (Periodic/polled)
         * @type {number}
         */
        COV = 0x36,

        /**
         * Dilution of precision. (Periodic/polled)
         * @type {number}
         */
        DOP = 0x04,

        /**
         * End of epoch. (Periodic)
         * @type {number}
         */
        EOE = 0x61,

        /**
         * Geofencing status. (Periodic/polled)
         * @type {number}
         */
        GEOFENCE = 0x39,

        /**
         * High precision position solution in ECEF. (Periodic/polled)
         * @type {number}
         */
        HPPOSECEF = 0x13,

        /**
         * High precision geodetic position solution. (Periodic/polled)
         * @type {number}
         */
        HPPOSLLH = 0x14,

        /**
         * Odometer solution. (Periodic/polled)
         * @type {number}
         */
        ODO = 0x09,

        /**
         * GNSS orbit database info. (Periodic/polled)
         * @type {number}
         */
        ORB = 0x34,

        /**
         * Protection level information. (Periodic)
         * @type {number}
         */
        PL = 0x62,

        /**
         * Position solution in ECEF. (Periodic/polled)
         * @type {number}
         */
        POSECEF = 0x01,

        /**
         * Geodetic position solution. (Periodic/polled)
         * @type {number}
         */
        POSLLH = 0x02,

        /**
         * Navigation position velocity time solution. (Periodic/polled)
         * @type {number}
         */
        PVT = 0x07,

        /**
         * Relative positioning information in NED frame. (Periodic/polled)
         * @type {number}
         */
        RELPOSNED = 0x3c,

        /**
         * Reset odometer. (Command)
         * @type {number}
         */
        RESETODO = 0x10,

        /**
         * Satellite information. (Periodic/polled)
         * @type {number}
         */
        SAT = 0x35,

        /**
         * SBAS status data. (Periodic/polled)
         * @type {number}
         */
        SBAS = 0x32,

        /**
         * Signal information. (Periodic/polled)
         * @type {number}
         */
        SIG = 0x43,

        /**
         * QZSS L1S SLAS status data. (Periodic/polled)
         * @type {number}
         */
        SLAS = 0x42,

        /**
         * Receiver navigation status. (Periodic/polled)
         * @type {number}
         */
        STATUS = 0x03,

        /**
         * Survey-in data. (Periodic/polled)
         * @type {number}
         */
        SVIN = 0x3b,

        /**
         * BeiDou time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEBDS = 0x24,

        /**
         * Galileo time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEGAL = 0x25,

        /**
         * GLONASS time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEGLO = 0x23,

        /**
         * GPS time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEGPS = 0x20,

        /**
         * Leap second event information. (Periodic/polled)
         * @type {number}
         */
        TIMELS = 0x26,

        /**
         * QZSS time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEQZSS = 0x27,

        /**
         * UTC time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEUTC = 0x21,

        /**
         * Velocity solution in ECEF. (Periodic/polled)
         * @type {number}
         */
        VELECEF = 0x11,

        /**
         * Velocity solution in NED frame. (Periodic/polled)
         * @type {number}
         */
        VELNED = 0x12,
    }

    /**
     * Navigation solution messages (Secondary output)
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum NAV2 {
        /**
         * NAV2 message class identifier.
         * @type {number}
         */
        CLASS = 0x02,

        /**
         * Clock solution. (Periodic/polled)
         * @type {number}
         */
        CLOCK = 0x22,

        /**
         * Covariance matrices. (Periodic/polled)
         * @type {number}
         */
        COV = 0x36,

        /**
         * Dilution of precision. (Periodic/polled)
         * @type {number}
         */
        DOP = 0x04,

        /**
         * End of epoch. (Periodic)
         * @type {number}
         */
        EOE = 0x61,

        /**
         * Odometer solution. (Periodic/polled)
         * @type {number}
         */
        ODO = 0x09,

        /**
         * Position solution in ECEF. (Periodic/polled)
         * @type {number}
         */
        POSECEF = 0x01,

        /**
         * Geodetic position solution. (Periodic/polled)
         * @type {number}
         */
        POSLLH = 0x02,

        /**
         * Navigation position velocity time solution. (Periodic/polled)
         * @type {number}
         */
        PVT = 0x07,

        /**
         * Satellite information. (Periodic/polled)
         * @type {number}
         */
        SAT = 0x35,

        /**
         * SBAS status data. (Periodic/polled)
         * @type {number}
         */
        SBAS = 0x32,

        /**
         * Signal information. (Periodic/polled)
         * @type {number}
         */
        SIG = 0x43,

        /**
         * QZSS L1S SLAS status data. (Periodic/polled)
         * @type {number}
         */
        SLAS = 0x42,

        /**
         * Receiver navigation status. (Periodic/polled)
         * @type {number}
         */
        STATUS = 0x03,

        /**
         * Survey-in data. (Periodic/polled)
         * @type {number}
         */
        SVIN = 0x3b,

        /**
         * BeiDou time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEBDS = 0x24,

        /**
         * Galileo time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEGAL = 0x25,

        /**
         * GLONASS time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEGLO = 0x23,

        /**
         * GPS time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEGPS = 0x20,

        /**
         * Leap second event information. (Periodic/polled)
         * @type {number}
         */
        TIMELS = 0x26,

        /**
         * QZSS time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEQZSS = 0x27,

        /**
         * UTC time solution. (Periodic/polled)
         * @type {number}
         */
        TIMEUTC = 0x21,

        /**
         * Velocity solution in ECEF. (Periodic/polled)
         * @type {number}
         */
        VELECEF = 0x11,

        /**
         * Velocity solution in NED frame. (Periodic/polled)
         * @type {number}
         */
        VELNED = 0x12,
    }

    /**
     * Receiver manager messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum RXM {
        /**
         * RXM message class identifier.
         * @type {number}
         */
        CLASS = 0x02,

        /**
         * Differential correction input status. (Output)
         * @type {number}
         */
        COR = 0x34,

        /**
         * Satellite measurements for RRLP. (Periodic/polled)
         * @type {number}
         */
        MEASX = 0x14,

        /**
         * PMP (LBAND) message. (Input)
         * @type {number}
         */
        PMP = 0x72,

        /**
         * Power management request. (Command)
         * @type {number}
         */
        PMREQ = 0x41,

        /**
         * QZSS L6 message. (Input)
         * @type {number}
         */
        QZSSL6 = 0x73,

        /**
         * Multi-GNSS raw measurements. (Periodic/polled)
         * @type {number}
         */
        RAWX = 0x15,

        /**
         * Galileo SAR short-RLM report. (Output)
         * @type {number}
         */
        RLM = 0x59,

        /**
         * RTCM input status. (Output)
         * @type {number}
         */
        RTCM = 0x32,

        /**
         * Broadcast navigation data subframe. (Output)
         * @type {number}
         */
        SFRBX = 0x13,

        /**
         * SPARTN input status. (Output)
         * @type {number}
         */
        SPARTN = 0x33,

        /**
         * Poll installed keys. (Poll request)
         * @type {number}
         */
        SPARTNKEY = 0x36,
    }

    /**
     * Security messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum SEC {
        /**
         * SEC message class identifier.
         * @type {number}
         */
        CLASS = 0x27,

        /**
         * Signal security information. (Periodic/polled)
         * @type {number}
         */
        SIG = 0x09,

        /**
         * Signal security log. (Periodic/polled)
         * @type {number}
         */
        SIGLOG = 0x10,

        /**
         * Unique chip ID. (Output)
         * @type {number}
         */
        UNIQID = 0x03,
    }

    /**
     * Timing messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum TIM {
        /**
         * TIM message class identifier.
         * @type {number}
         */
        CLASS = 0x0d,

        /**
         * Time mark data. (Periodic/polled)
         * @type {number}
         */
        TM2 = 0x03,

        /**
         * Time pulse time data. (Periodic/polled)
         * @type {number}
         */
        TP = 0x01,

        /**
         * Sourced time verification. (Periodic/polled)
         * @type {number}
         */
        VRFY = 0x06,
    }

    /**
     * Firmware update messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export enum UPD {
        /**
         * UPD message class identifier.
         * @type {number}
         */
        CLASS = 0x09,

        /**
         * Poll backup restore status. (Poll request)
         * @type {number}
         */
        SOS = 0x14,
    }

    /**
     * Selected bitmask values for various UBX messages
     * @enum {number}
     * @readonly
     * @memberof UBX
     */
    export namespace MASK {
        /**
         * Bitmask values for UBX-CFG-PRT
         * @enum {number}
         * @readonly
         * @memberof UBX.MASK
         */
        export enum PROTO {
            /**
             * No protocol (UBX-CFG-PRT)
             * @type {number}
             */
            NONE = 0x00,

            /**
             * UBX protocol (UBX-CFG-PRT)
             * @type {number}
             */
            UBX = 0x01,

            /**
             * NMEA protocol (UBX-CFG-PRT)
             * @type {number}
             */
            NMEA = 0x02,

            /**
             * RTCM3 protocol (UBX-CFG-PRT)
             * @type {number}
             */
            RTCM3 = 0x20,
        }

        /**
         * Bitmask values for UBX-CFG-PRT
         * @enum {number}
         * @readonly
         * @memberof UBX.MASK
         */
        export enum PORTID {
            /**
             * I2C port (UBX-CFG-PRT)
             * @type {number}
             */
            I2C = 0x00,

            /**
             * UART1 port (UBX-CFG-PRT)
             * @type {number}
             */
            UART1 = 0x01,

            /**
             * UART2 port (UBX-CFG-PRT)
             * @type {number}
             */
            UART2 = 0x02,

            /**
             * USB port (UBX-CFG-PRT)
             * @type {number}
             */
            USB = 0x03,

            /**
             * SPI port (UBX-CFG-PRT)
             * @type {number}
             */
            SPI = 0x04,
        }

        /**
         * Bitmask values for UBX-CFG-RST
         * @enum {number}
         * @readonly
         * @memberof UBX.MASK
         */
        export enum RESET_TYPE {
            /**
             * Hot start (UBX-CFG-RST)
             * @type {number}
             */
            HOT_START = 0x0000,

            /**
             * Warm start (UBX-CFG-RST)
             * @type {number}
             */
            WARM_START = 0x0001,

            /**
             * Cold start (UBX-CFG-RST)
             * @type {number}
             */
            COLD_START = 0xFFFF,
        }

        /**
         * Bitmask values for UBX-CFG-RST
         * @enum {number}
         * @readonly
         * @memberof UBX.MASK
         */
        export enum RESET_MODE {
            /**
             * Hardware reset (watchdog) immediately (UBX-CFG-RST)
             * @type {number}
             */
            FORCED_HARDWARE = 0x00,

            /**
             * Controlled software reset (UBX-CFG-RST)
             * @type {number}
             */
            CONTROLLED = 0x01,

            /**
             * Controlled software reset, GNSS only (UBX-CFG-RST)
             * @type {number}
             */
            CONTROLLED_GNSS_ONLY = 0x02,

            /**
             *  Hardware reset (watchdog) after shutdown (UBX-CFG-RST)
             * @type {number}
             */
            CONTROLLED_HARDWARE = 0x04,
        }
    } // namespace MASK
} // namespace UBX

/**
 * Complete list of NMEA messages from the ZedF-9P Interface Description
 * @see {@link https://content.u-blox.com/sites/default/files/documents/u-blox-F9-HPG-L1L5-1.40_InterfaceDescription_UBX-23006991.pdf}
 * @namespace NMEA
 */
export namespace NMEA {
    /**
     * Standard NMEA messages
     * @enum {number}
     * @readonly
     * @memberof NMEA
     */
    export enum STANDARD {
        /**
         * NMEA STANDARD message class identifier
         * @type {number}
         */
        CLASS = 0xf0,

        /**
         * Datum reference (Output)
         * @type {number}
         */
        DTM = 0x0a,

        /**
         * Poll a standard message (Talker ID GA) (Poll request)
         * @type {number}
         */
        GAQ = 0x45,

        /**
         * Poll a standard message (Talker ID GB) (Poll request)
         * @type {number}
         */
        GBQ = 0x44,

        /**
         * GNSS satellite fault detection (Output)
         * @type {number}
         */
        GBS = 0x09,

        /**
         * Global positioning system fix data (Output)
         * @type {number}
         */
        GGA = 0x00,

        /**
         * Latitude and longitude, with time of position fix and status (Output)
         * @type {number}
         */
        GLL = 0x01,

        /**
         * Poll a standard message (Talker ID GL) (Poll request)
         * @type {number}
         */
        GLQ = 0x43,

        /**
         * Poll a standard message (Talker ID GN) (Poll request)
         * @type {number}
         */
        GNQ = 0x42,

        /**
         * GNSS fix data (Output)
         */
        GNS = 0x0d,

        /**
         * Poll a standard message (Talker ID GP) (Poll request)
         * @type {number}
         */
        GPQ = 0x40,

        /**
         * Poll a standard message (Talker ID GQ) (Poll request)
         * @type {number}
         */
        GQQ = 0x47,

        /**
         * GNSS range residuals (Output)
         * @type {number}
         */
        GRS = 0x06,

        /**
         * GNSS DOP and active satellites (Output)
         * @type {number}
         */
        GSA = 0x02,

        /**
         * GNSS pseudorange error statistics (Output)
         * @type {number}
         */
        GST = 0x07,

        /**
         * GNSS satellites in view (Output)
         * @type {number}
         */
        GSV = 0x03,

        /**
         * Return link message (RLM) (Output)
         * @type {number}
         */
        RLM = 0x0b,

        /**
         * Recommended minimum data (Output)
         * @type {number}
         */
        RMC = 0x04,

        /**
         * Text transmission (Output)
         * @type {number}
         */
        TXT = 0x41,

        /**
         * Dual ground/water distance (Output)
         * @type {number}
         */
        VLW = 0x0f,

        /**
         * Course over ground and ground speed (Output)
         * @type {number}
         */
        VTG = 0x05,

        /**
         * Time and date (Output)
         * @type {number}
         */
        ZDA = 0x08,
    }

    /**
     * Secondary output NMEA messages.
     * @enum {number}
     * @readonly
     * @memberof NMEA
     */
    export enum NAV2 {
        /**
         * NMEA NAV2 message class identifier
         * @type {number}
         */
        CLASS = 0xf7,

        /**
         * Global positioning system fix data (Output)
         * @type {number}
         */
        GGA = 0x00,

        /**
         * Latitude and longitude, with time of position fix and status (Output)
         * @type {number}
         */
        GLL = 0x01,

        /**
         * GNSS fix data (Output)
         * @type {number}
         */
        GNS = 0x0d,

        /**
         * GNSS DOP and active satellites (Output)
         * @type {number}
         */
        GSA = 0x02,

        /**
         * Recommended minimum data (Output)
         * @type {number}
         */
        RMC = 0x04,

        /**
         * Course over ground and ground speed (Output)
         * @type {number}
         */
        VTG = 0x05,

        /**
         * Time and date (Output)
         * @type {number}
         */
        ZDA = 0x08,
    }
    /**
     * u-blox proprietary NMEA messages.
     * @enum {number}
     * @readonly
     * @memberof NMEA
     */
    export enum PUBX {
        /**
         * NMEA PUBX message class identifier
         * @type {number}
         */
        CLASS = 0xf1,
        /**
         * Set protocols and baud rate (Set)
         * @type {number}
         */
        CONFIG = 0x41,

        /**
         * Poll a PUBX,00 message (Poll request)
         * Lat/Long position data (Output)
         * @type {number}
         */
        POSITION = 0x00,

        /**
         * Set NMEA message output rate (Set)
         * @type {number}
         */
        RATE = 0x40,

        /**
         * Poll a PUBX,03 message (Poll request)
         * Satellite status (Output)
         * @type {number}
         */
        SVSTATUS = 0x03,

        /**
         * Poll a PUBX,04 message (Poll request)
         * Time of day and clock information (Output)
         * @type {number}
         */
        TIME = 0x04,
    }
} // namespace NMEA

/**
 * Complete list of RTCM-3X messages from the ZedF-9P Interface Description
 * @see {@link https://content.u-blox.com/sites/default/files/documents/u-blox-F9-HPG-L1L5-1.40_InterfaceDescription_UBX-23006991.pdf}
 * @enum {number}
 * @readonly
 */
export enum RTCM_3X {
    /**
     * RTCM-3X message class identifier.
     * @type {number}
     */
    CLASS = 0xf5,

    /**
     * L1-only GPS RTK observables (Input).
     * @type {number}
     */
    TYPE1001 = 0x01,

    /**
     * Extended L1-only GPS RTK observables (Input).
     * @type {number}
     */
    TYPE1002 = 0x02,

    /**
     * L1/L2 GPS RTK observables (Input).
     * @type {number}
     */
    TYPE1003 = 0x03,

    /**
     * Extended L1/L2 GPS RTK observables (Input).
     * @type {number}
     */
    TYPE1004 = 0x04,

    /**
     * Stationary RTK reference station ARP (Input/output).
     * @type {number}
     */
    TYPE1005 = 0x05,

    /**
     * Stationary RTK reference station ARP with antenna height (Input).
     * @type {number}
     */
    TYPE1006 = 0x06,

    /**
     * Antenna descriptor (Input).
     * @type {number}
     */
    TYPE1007 = 0x07,

    /**
     * L1-only GLONASS RTK observables (Input).
     * @type {number}
     */
    TYPE1009 = 0x09,

    /**
     * Extended L1-Only GLONASS RTK observables (Input).
     * @type {number}
     */
    TYPE1010 = 0x0a,

    /**
     * L1&L2 GLONASS RTK observables (Input).
     * @type {number}
     */
    TYPE1011 = 0xa1,

    /**
     * Extended L1&L2 GLONASS RTK observables (Input).
     * @type {number}
     */
    TYPE1012 = 0xa2,

    /**
     * Receiver and antenna descriptors (Input).
     * @type {number}
     */
    TYPE1033 = 0x21,

    /**
     * GPS MSM4 (Input/output).
     * @type {number}
     */
    TYPE1074 = 0x4a,

    /**
     * GPS MSM5 (Input).
     * @type {number}
     */
    TYPE1075 = 0x4b,

    /**
     * GPS MSM7 (Input/output).
     * @type {number}
     */
    TYPE1077 = 0x4d,

    /**
     * GLONASS MSM4 (Input/output).
     * @type {number}
     */
    TYPE1084 = 0x54,

    /**
     * GLONASS MSM5 (Input).
     * @type {number}
     */
    TYPE1085 = 0x55,

    /**
     * GLONASS MSM7 (Input/output).
     * @type {number}
     */
    TYPE1087 = 0x57,

    /**
     * Galileo MSM4 (Input/output).
     * @type {number}
     */
    TYPE1094 = 0x5e,

    /**
     * Galileo MSM5 (Input).
     * @type {number}
     */
    TYPE1095 = 0x5f,

    /**
     * Galileo MSM7 (Input/output).
     * @type {number}
     */
    TYPE1097 = 0x61,

    /**
     * BeiDou MSM4 (Input/output).
     * @type {number}
     */
    TYPE1124 = 0x7c,

    /**
     * BeiDou MSM5 (Input).
     * @type {number}
     */
    TYPE1125 = 0x7d,

    /**
     * BeiDou MSM7 (Input/output).
     * @type {number}
     */
    TYPE1127 = 0x7f,

    /**
     * GLONASS L1 and L2 code-phase biases (Input/output).
     * @type {number}
     */
    TYPE1230 = 0xe6,

    /**
     * uBlox proprietary
     * @type {number}
     */
    TYPE4072 = 0xfe,
}
