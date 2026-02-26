import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '@repository';
import { PasswordService } from '@security';
import { UserError } from '@error/user/user-error';
import { passwordValidityChecker, omitPassword } from '@util';
import { HandleUserErrors } from '@common';
import {
  User,
  UpdateUserDto,
  UserPreference,
  UserPreferenceDto,
} from '@type/index';
import {
  ChangePasswordRequest,
  DeleteUserRequest,
  UpdateUserInfoRequest,
  UserResponse,
} from '@api-interfaces';

/**
 * Service for managing user-related operations.
 *
 * Provides business logic for user data management including password changes,
 * user data retrieval, account deletion, and user information updates.
 * All operations are wrapped with error handling decorators.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepositoryService,
    private readonly password: PasswordService
  ) {}
  /**
   * Changes a user's password with validation.
   *
   * Validates the old password against the stored hash and ensures the new password
   * meets security requirements before updating. Uses atomic update to ensure
   * data consistency.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {ChangePasswordRequest} dto - Password change request containing old and new passwords
   * @returns {Promise<void>} No return value on success
   * @throws {UserError} When old password is incorrect or new password is invalid
   * @example
   * ```typescript
   * await userService.changePassword("user123", {
   *   oldPassword: "oldpass123",
   *   newPassword: "newpass456"
   * });
   * ```
   */
  @HandleUserErrors()
  async changePassword(userId: string, dto: ChangePasswordRequest) {
    const changePasswordCallback = async (user: User): Promise<User> => {
      if (await this.password.comparePlainAndHash(dto.oldPassword, user.password)) {
        if (!passwordValidityChecker(dto.newPassword)) {
          throw UserError.BadNewPassword();
        }
      } else {
        throw UserError.OldPasswordMismatch();
      }

      user.password = await this.password.getHashedValue(dto.newPassword);

      return user;
    };
    await this.repository.atomicUpdateUser(userId, changePasswordCallback);
  }

  /**
   * Retrieves user data excluding the password field.
   *
   * Loads user information from the repository and removes the password field
   * for security purposes before returning the data.
   *
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<UserResponse>} User data without password
   * @throws {UserError} When user is not found
   * @example
   * ```typescript
   * const userData = await userService.getUserData("user123");
   * console.log(userData.department); // "IT"
   * // userData.password is undefined
   * ```
   */
  @HandleUserErrors()
  async getUserData(userId: string): Promise<UserResponse> {
    return omitPassword(await this.repository.loadUserById(userId));
  }

  /**
   * Retrieves user preferences.
   *
   * Loads user information and returns only the `user_preference` object.
   *
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<UserPreference>} User preferences
   * @throws {UserError} When user is not found
   * @example
   * ```typescript
   * const preferences = await userService.getUserPreferences("user123");
   * console.log(preferences.dashboardInterval); // 10
   * ```
   */
  @HandleUserErrors()
  async getUserPreferences(userId: string): Promise<UserPreference> {
    const user = await this.repository.loadUserById(userId);
    return user.user_preference;
  }

  /**
   * Permanently deletes a user account after password verification.
   *
   * Validates the provided password against the stored hash before deleting.
   * Removes the user and all associated data from the repository.
   * This operation cannot be undone.
   *
   * @param {string} userId - The unique identifier of the user to delete
   * @param {DeleteUserRequest} request - Request containing password for verification
   * @returns {Promise<void>} No return value on success
   * @throws {UserError} When user is not found or password is incorrect
   * @example
   * ```typescript
   * await userService.deleteUser("user123", { password: "userpassword" });
   * // User account is permanently deleted after password verification
   * ```
   */
  @HandleUserErrors()
  async deleteUser(userId: string, request: DeleteUserRequest): Promise<void> {
    // Load user to verify password
    const user = await this.repository.loadUserById(userId);

    // Verify password before deletion
    if (!(await this.password.comparePlainAndHash(request.password, user.password))) {
      throw UserError.OldPasswordMismatch();
    }

    // Password verified, proceed with deletion
    await this.repository.deleteUser(userId);
  }

  /**
   * Updates user's non-credential information with provided data.
   *
   * Updates specific user fields based on the provided update object.
   * This method supports nested updates for `user_preference`.
   * Uses atomic update to ensure data consistency.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {UpdateUserDto} update - Object containing fields to update
   * @returns {Promise<User>} The updated user object
   * @throws {UserError} When user is not found or update fails
   * @example
   * ```typescript
   * const updatedUser = await userService.updateProfile("user123", {
   *   department: "Engineering",
   *   user_preference: { dashboardInterval: 30 }
   * });
   * console.log(updatedUser.department); // "Engineering"
   * console.log(updatedUser.user_preference.dashboardInterval); // 30
   * ```
   */
  @HandleUserErrors()
  async updateProfile(userId: string, update: UpdateUserDto): Promise<User> {
    return await this.repository.atomicUpdateUser(userId, async (user: User) => {
      if (update.department) {
        user.department = update.department;
      }
      if (update.user_preference) {
        user.user_preference = {
          ...user.user_preference,
          ...update.user_preference,
        };
      }
      return user;
    });
  }

  /**
   * Updates user's preferences with provided data.
   *
   * Updates specific user preference fields based on the provided update object.
   * Uses atomic update to ensure data consistency.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {UserPreferenceDto} update - Object containing preference fields to update
   * @returns {Promise<User>} The updated user object
   * @throws {UserError} When user is not found or update fails
   * @example
   * ```typescript
   * const updatedUser = await userService.updateUserPreferences("user123", {
   *   dashboardInterval: 30
   * });
   * console.log(updatedUser.user_preference.dashboardInterval); // 30
   * ```
   */
  @HandleUserErrors()
  async updateUserPreferences(userId: string, update: UserPreferenceDto): Promise<User> {
    return await this.repository.atomicUpdateUser(userId, async (user: User) => {
      user.user_preference = {
        ...user.user_preference,
        ...update,
      };
      return user;
    });
  }

  /**
   * Updates user information with provided data.
   *
   * Updates specific user fields based on the provided update object.
   * Uses atomic update to ensure data consistency. Only fields present
   * in the update object will be modified.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {UpdateUserInfoRequest} update - Object containing fields to update
   * @returns {Promise<User>} The updated user object
   * @throws {UserError} When user is not found or update fails
   * @example
   * ```typescript
   * const updatedUser = await userService.updateUser("user123", {
   *   department: "Engineering"
   * });
   * console.log(updatedUser.department); // "Engineering"
   * ```
   */
  @HandleUserErrors()
  async updateUser(userId: string, update: UpdateUserInfoRequest): Promise<User> {
    return await this.repository.atomicUpdateUser(userId, async (user: User) => {
      Object.entries(update).forEach(([key, value]) => {
        (user as any)[key] = value;
      });
      return user;
    });
  }
}
