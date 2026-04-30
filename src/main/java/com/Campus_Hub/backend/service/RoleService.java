package com.Campus_Hub.backend.service;

import com.Campus_Hub.backend.enums.Role;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface RoleService {
    Map<String, Object> getUserWithRoles(Long userId);
    Map<String, Object> updateUserRoles(Long userId, Set<Role> roles);
    List<Map<String, Object>> getAllUsersWithRoles(int page, int size);
}
