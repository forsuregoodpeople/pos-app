## Error Type
Console Error

## Error Message
Error updating global setting: {}


    at updateGlobalSettingAction (services/mechanic-settings/mechanic-settings.ts:254:21)

## Code Frame
  252 |
  253 |         if (error) {
> 254 |             console.error('Error updating global setting:', error);
      |                     ^
  255 |             throw new Error('Gagal mengupdate pengaturan global');
  256 |         }
  257 |         return data;

Next.js version: 15.5.9 (Turbopack)


## Error Type
Console Error

## Error Message
Gagal mengupdate pengaturan global


    at updateGlobalSettingAction (services/mechanic-settings/mechanic-settings.ts:255:19)

## Code Frame
  253 |         if (error) {
  254 |             console.error('Error updating global setting:', error);
> 255 |             throw new Error('Gagal mengupdate pengaturan global');
      |                   ^
  256 |         }
  257 |         return data;
  258 |     } catch (error) {

Next.js version: 15.5.9 (Turbopack)

## Error Type
Console Error

## Error Message
Gagal mengupdate pengaturan global


    at updateGlobalSettingAction (services/mechanic-settings/mechanic-settings.ts:260:15)

## Code Frame
  258 |     } catch (error) {
  259 |         console.error('Error updating global setting:', error);
> 260 |         throw new Error('Gagal mengupdate pengaturan global');
      |               ^
  261 |     }
  262 | }
  263 |

Next.js version: 15.5.9 (Turbopack)
