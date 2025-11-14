EDS_Readme.txt

On the directory you will find the ODVA certified EDS file. Some manufacturers do not implement all specified features from the Standard or have implementation problems.  Therefore, Murrelektronik prepared variations from the certified EDS file in these folders:

01_certified:       EDS file that should work with Omron PLCs and other plcs that supports certified eds files

02_Manufacturer_1:  EDS file variations that should work with

                    - Allen Bradley PLCs >= V33

                    This file is a variation from the certified EDS file with different datatypes.

03_Manufacturer_2:  EDS without IoT Parameters.
                    Should work with

                    - Allen Bradley PLCs < V33
                    - Mitsubishi PLCs
                    - Delta PLCs
                    - Codesys based PLCs
                    - others PLCs, that not support data type "String".

                     This file is a variation from the certified EDS file without IoT Parameters
