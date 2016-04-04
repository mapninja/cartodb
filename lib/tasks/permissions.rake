namespace :cartodb do
  namespace :permissions do
    desc 'setup default permissions for visualizations without them'
    task :fill_missing_permissions, [:auto_fix] => [:environment] do |_, args|
      File.open('log/fill_missing_permissions.log', 'a') do |log_file|
        auto_fix = args[:auto_fix].present?

        # This uses the new models to avoid triggering side-effects
        viz = Carto::Visualization.select('visualizations.*')
                                  .joins('LEFT JOIN permissions ON visualizations.permission_id = permissions.id')
                                  .where('permissions.id IS NULL OR permissions.entity_id != visualizations.id')
        puts "*** Updating permissions for #{viz.count} visualization"
        puts "*** Automatically fixing conflicts" if auto_fix
        sleep 5
        failed_ids = []
        viz.each do |v|
          begin
            puts '*** Updating permissions for visualization ' + v.id
            # Tries to find existing permission
            perms = Carto::Permission.where(entity_id: v.id).all
            if perms.count == 0
              puts '  - Creating new default permission'
              perm = Carto::Permission.create(
                owner_id:       v.user.id,
                owner_username: v.user.username,
                entity_id:      v.id,
                entity_type:    'vis'
              )
              log_file.puts "Visualization #{v.id}, permission changed from '#{v.permission_id}' to '#{perm.id}' (default)"
              v.permission_id = perm.id
              v.save
            elsif perms.count == 1 || auto_fix
              puts '  - Reusing existing permission'
              log_file.puts "Visualization #{v.id}, permission changed from '#{v.permission_id}' to '#{perms.first.id}'"
              v.permission_id = perms.first.id
              v.save
            else
              puts '  - Multiple permissions, skipping'
              failed_ids << v.id
            end
            sleep 0.2
          rescue => e
            puts 'ERROR ' + e.message
            puts e.backtrace.join("\n")
            failed_ids << v.id
          end
        end
        unless failed_ids.empty?
          puts '*** Failed visualizations:'
          puts failed_ids.join('\n')
        end
      end
    end
  end
end
